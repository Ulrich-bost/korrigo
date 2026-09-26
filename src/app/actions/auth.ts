"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { rethrowNavigationError } from "@/lib/navigation-error";

const UNAVAILABLE = "Le service est momentanément indisponible. Réessayez dans quelques minutes.";

function safeRedirect(value: FormDataEntryValue | null) {
  const raw = value?.toString() || "/sujets";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

const registerSchema = z.object({
  name: z.string().min(2, "Nom requis (min. 2 caractères)"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe : min. 8 caractères"),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Un compte existe déjà avec cet email" };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    rethrowNavigationError(error);
    return { error: UNAVAILABLE };
  }

  redirect(safeRedirect(formData.get("redirect")));
}

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return { error: "Email ou mot de passe incorrect" };
    }

    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    rethrowNavigationError(error);
    return { error: UNAVAILABLE };
  }

  redirect(safeRedirect(formData.get("redirect")));
}

export async function logoutAction() {
  const { destroySession } = await import("@/lib/auth");
  await destroySession();
  redirect("/");
}
