"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const subjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  content: z.string().optional(),
  department: z.string().min(2),
  faculty: z.string().min(2),
  level: z.enum(["L1", "L2", "L3"]),
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
    content: formData.get("content") || undefined,
    department: formData.get("department"),
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

  let university = await prisma.university.findFirst();
  if (!university) {
    university = await prisma.university.create({
      data: { name: "Général", slug: "general" },
    });
  }

  await prisma.subject.create({
    data: { ...data, slug, universityId: university.id, isPremium: data.isPremium ?? true },
  });

  redirect("/admin?created=1");
}
