"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STUDY_LEVELS } from "@/lib/taxonomy";

const profileSchema = z.object({
  programId: z.string().uuid(),
  level: z.enum(STUDY_LEVELS),
  objectives: z.string().max(2000).optional(),
});

export async function updateProfileAction(formData: FormData) {
  const user = await requireAuth().catch(() => null);
  if (!user) redirect("/connexion?redirect=/compte");
  if (user.role !== "student") redirect("/admin");

  const parsed = profileSchema.safeParse({
    programId: formData.get("programId"),
    level: formData.get("level"),
    objectives: formData.get("objectives")?.toString() || undefined,
  });
  if (!parsed.success) redirect("/compte?error=invalid");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      program_id: parsed.data.programId,
      level: parsed.data.level,
      objectives: parsed.data.objectives ?? null,
    })
    .eq("id", user.id);
  if (error) redirect("/compte?error=unavailable");

  revalidatePath("/compte");
  revalidatePath("/tarifs");
  redirect("/compte");
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
