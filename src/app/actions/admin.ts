"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { STUDY_LEVELS } from "@/lib/taxonomy";

const subjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  content: z.string().optional(),
  department: z.string().min(2),
  faculty: z.string().min(2),
  level: z.enum(STUDY_LEVELS),
  year: z.coerce.number().int().min(2000).max(2035),
  semester: z.string().optional(),
  examType: z.string().min(2),
  isFree: z.enum(["true", "false"]),
});

const correctionSchema = z.object({
  examId: z.string().uuid(),
  content: z.string().optional(),
});

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const FILE_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);
const FILE_EXTENSIONS = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);

function asFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size <= 0) return null;
  return value;
}

function fileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
}

function invalidFile(file: File) {
  if (file.size > MAX_FILE_BYTES) return true;
  if (!FILE_EXTENSIONS.has(fileExtension(file))) return true;
  if (file.type && file.type !== "application/octet-stream" && !FILE_TYPES.has(file.type)) return true;
  return false;
}

async function uploadExamFile(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  examId: string,
  file: File,
  kind: "subject" | "correction"
): Promise<{ error: "invalid" | "unavailable" } | { path: string }> {
  if (invalidFile(file)) return { error: "invalid" };
  const path = `${examId}/${kind}-${Date.now()}.${fileExtension(file)}`;
  const { error } = await supabase.storage.from("exams").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) return { error: "unavailable" };
  return { path };
}

export async function createSubjectAction(formData: FormData) {
  try {
    await requireStaff();
  } catch {
    return { error: "denied" };
  }

  const parsed = subjectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    content: formData.get("content") || undefined,
    department: formData.get("department"),
    faculty: formData.get("faculty"),
    level: formData.get("level"),
    year: formData.get("year"),
    semester: formData.get("semester") || undefined,
    examType: formData.get("examType"),
    isFree: formData.get("isFree"),
  });
  if (!parsed.success) return { error: "invalid" };

  const subjectFile = asFile(formData.get("subjectFile"));
  if (!subjectFile || invalidFile(subjectFile)) return { error: "invalid" };

  const data = parsed.data;
  const supabase = createSupabaseServerClient();
  const { data: department } = await supabase
    .from("departments")
    .select("id")
    .eq("name", data.department)
    .maybeSingle();
  if (!department) return { error: "invalid" };

  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("department_id", department.id)
    .eq("name", data.faculty)
    .maybeSingle();
  if (!program) return { error: "invalid" };

  let slug = slugify(data.title);
  const { data: existing } = await supabase.from("exams").select("id").eq("slug", slug).maybeSingle();
  if (existing) slug = `${slug}-${Date.now()}`;

  const { data: exam, error } = await supabase
    .from("exams")
    .insert({
      program_id: program.id,
      level: data.level,
      title: data.title,
      slug,
      description: data.description ?? null,
      year: data.year,
      semester: data.semester ?? null,
      exam_type: data.examType,
      is_free: data.isFree === "true",
    })
    .select("id")
    .single();
  if (error || !exam) return { error: "unavailable" };

  const subjectUpload = await uploadExamFile(supabase, exam.id, subjectFile, "subject");
  if ("error" in subjectUpload) {
    await supabase.from("exams").delete().eq("id", exam.id);
    return { error: subjectUpload.error };
  }
  const { error: subjectPathError } = await supabase
    .from("exams")
    .update({ file_path: subjectUpload.path })
    .eq("id", exam.id);
  if (subjectPathError) {
    await supabase.storage.from("exams").remove([subjectUpload.path]);
    await supabase.from("exams").delete().eq("id", exam.id);
    return { error: "unavailable" };
  }

  const text = data.content?.trim() ? data.content.trim() : null;
  const file = asFile(formData.get("correctionFile"));
  if (text || file) {
    let filePath: string | null = null;
    if (file) {
      const uploaded = await uploadExamFile(supabase, exam.id, file, "correction");
      if ("error" in uploaded) return { error: uploaded.error };
      filePath = uploaded.path;
    }
    const { error: correctionError } = await supabase.from("corrections").insert({
      exam_id: exam.id,
      body: text,
      file_path: filePath,
      kind: "manual",
    });
    if (correctionError) return { error: "unavailable" };
  }

  revalidatePath("/sujets");
  revalidatePath(`/sujets/${slug}`);
  revalidatePath("/espace");
  revalidatePath("/admin");
  revalidatePath("/admin/sujets");
  redirect("/admin/sujets?created=1");
}

export async function saveCorrectionAction(formData: FormData) {
  try {
    await requireStaff();
  } catch {
    return { error: "denied" };
  }

  const parsed = correctionSchema.safeParse({
    examId: formData.get("examId"),
    content: formData.get("content") || undefined,
  });
  if (!parsed.success) return { error: "invalid" };

  const { examId, content } = parsed.data;
  const supabase = createSupabaseServerClient();
  const { data: exam } = await supabase.from("exams").select("id, slug").eq("id", examId).maybeSingle();
  if (!exam) return { error: "denied" };

  const text = content?.trim() ? content.trim() : null;
  const file = asFile(formData.get("correctionFile"));
  const { data: current } = await supabase
    .from("corrections")
    .select("id, file_path")
    .eq("exam_id", examId)
    .maybeSingle();

  let filePath = current?.file_path ?? null;
  if (file) {
    const uploaded = await uploadExamFile(supabase, examId, file, "correction");
    if ("error" in uploaded) return { error: uploaded.error };
    filePath = uploaded.path;
  }

  if (!text && !filePath) return { error: "invalid" };

  const payload = { body: text, file_path: filePath, kind: "manual" as const };
  const { error } = current
    ? await supabase.from("corrections").update(payload).eq("id", current.id)
    : await supabase.from("corrections").insert({ exam_id: examId, ...payload });
  if (error) return { error: "unavailable" };

  revalidatePath("/admin");
  revalidatePath(`/admin/sujets/${examId}`);
  revalidatePath("/espace");
  revalidatePath("/sujets");
  revalidatePath(`/sujets/${exam.slug}`);
  redirect(`/admin/sujets/${examId}?saved=1`);
}

export async function saveSubjectFileAction(formData: FormData) {
  try {
    await requireStaff();
  } catch {
    return { error: "denied" };
  }

  const examId = String(formData.get("examId") || "");
  if (!z.string().uuid().safeParse(examId).success) return { error: "invalid" };

  const file = asFile(formData.get("subjectFile"));
  if (!file) return { error: "invalid" };

  const supabase = createSupabaseServerClient();
  const { data: exam } = await supabase.from("exams").select("id, slug").eq("id", examId).maybeSingle();
  if (!exam) return { error: "denied" };

  const uploaded = await uploadExamFile(supabase, examId, file, "subject");
  if ("error" in uploaded) return { error: uploaded.error };

  const { error } = await supabase.from("exams").update({ file_path: uploaded.path }).eq("id", examId);
  if (error) {
    await supabase.storage.from("exams").remove([uploaded.path]);
    return { error: "unavailable" };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/sujets");
  revalidatePath(`/admin/sujets/${examId}`);
  revalidatePath("/espace");
  revalidatePath("/sujets");
  revalidatePath(`/sujets/${exam.slug}`);
  redirect(`/admin/sujets/${examId}?file=1`);
}
