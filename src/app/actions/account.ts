"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { getAcademicTree } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STUDY_LEVELS } from "@/lib/taxonomy";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(160),
  programId: z.string().uuid(),
  level: z.enum(STUDY_LEVELS),
  objectives: z.string().max(2000).optional(),
});

function refreshAccount() {
  revalidatePath("/", "layout");
  revalidatePath("/compte");
  revalidatePath("/espace");
  revalidatePath("/tarifs");
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/connexion?redirect=/compte");
  if (user.role !== "student") redirect("/admin");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    programId: formData.get("programId"),
    level: formData.get("level"),
    objectives: formData.get("objectives")?.toString() || undefined,
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    redirect(field === "name" ? "/compte?error=name" : "/compte?error=invalid");
  }

  if (user.programId && user.programId !== parsed.data.programId) {
    const tree = await getAcademicTree();
    const department = tree.find((item) => item.programs.some((program) => program.id === user.programId));
    if (department && !department.programs.some((program) => program.id === parsed.data.programId)) {
      redirect("/compte?error=invalid");
    }
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.name,
      program_id: parsed.data.programId,
      level: parsed.data.level,
      objectives: parsed.data.objectives ?? null,
    })
    .eq("id", user.id);
  if (error) redirect("/compte?error=unavailable");

  await supabase.auth.updateUser({ data: { full_name: parsed.data.name } });

  refreshAccount();
  redirect("/compte?saved=name");
}

export async function updatePasswordAction(formData: FormData) {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/connexion?redirect=/compte");
  if (user.role !== "student") redirect("/admin");

  const password = formData.get("password")?.toString() ?? "";
  const passwordConfirm = formData.get("passwordConfirm")?.toString() ?? "";
  if (password !== passwordConfirm) redirect("/compte?error=password_mismatch");
  if (password.length < 8) redirect("/compte?error=password");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/compte?error=unavailable");

  refreshAccount();
  redirect("/compte?saved=password");
}

const scheduleSchema = z.object({
  label: z.string().min(2).max(160),
  examOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function addExamDateAction(formData: FormData) {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/connexion?redirect=/compte");
  if (user.role !== "student") redirect("/admin");

  const parsed = scheduleSchema.safeParse({
    label: formData.get("label"),
    examOn: formData.get("examOn"),
  });
  if (!parsed.success) redirect("/compte?error=invalid");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("student_exam_schedules").insert({
    profile_id: user.id,
    label: parsed.data.label,
    exam_on: parsed.data.examOn,
  });
  if (error) redirect("/compte?error=unavailable");

  revalidatePath("/compte");
  redirect("/compte");
}
