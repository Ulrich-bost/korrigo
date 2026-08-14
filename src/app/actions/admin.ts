"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const subjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  universityId: z.string(),
  faculty: z.string().min(2),
  level: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2030),
  semester: z.string().optional(),
  examType: z.string().min(2),
  isPremium: z.coerce.boolean().optional(),
});

export async function createSubjectAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "Accès refusé" };
  }

  const parsed = subjectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    universityId: formData.get("universityId"),
    faculty: formData.get("faculty"),
    level: formData.get("level"),
    year: formData.get("year"),
    semester: formData.get("semester") || undefined,
    examType: formData.get("examType"),
    isPremium: formData.get("isPremium") === "on",
  });

  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const data = parsed.data;
  let slug = slugify(data.title);
  const existing = await prisma.subject.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  await prisma.subject.create({
    data: { ...data, slug, isPremium: data.isPremium ?? true },
  });

  redirect("/admin?created=1");
}

export async function createUniversityAction(formData: FormData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "Accès refusé" };
  }

  const name = formData.get("name")?.toString().trim();
  const city = formData.get("city")?.toString().trim();
  if (!name) return { error: "Nom requis" };

  const slug = slugify(name);
  await prisma.university.create({
    data: { name, slug, city: city || null },
  });

  redirect("/admin?uni=1");
}
