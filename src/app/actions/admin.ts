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
  isPremium: z.coerce.boolean().optional(),
});

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
    isPremium: formData.get("isPremium") === "on",
  });
  if (!parsed.success) return { error: "invalid" };

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
      is_free: !(data.isPremium ?? true),
    })
    .select("id")
    .single();
  if (error || !exam) return { error: "unavailable" };

  if (data.content) {
    const { error: correctionError } = await supabase.from("corrections").insert({
      exam_id: exam.id,
      body: data.content,
      kind: "manual",
    });
    if (correctionError) return { error: "unavailable" };
  }

  revalidatePath("/sujets");
  revalidatePath("/admin");
  redirect("/admin?created=1");
}
