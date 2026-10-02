"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, landingPath } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rethrowNavigationError } from "@/lib/navigation-error";
import { STUDY_LEVELS } from "@/lib/taxonomy";

function safeRedirect(value: FormDataEntryValue | null) {
  const raw = value?.toString() || "/sujets";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  programId: z.string().uuid(),
  level: z.enum(STUDY_LEVELS),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    programId: formData.get("programId"),
    level: formData.get("level"),
  });

  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    if (field === "name") return { error: "name" };
    if (field === "email") return { error: "email" };
    if (field === "password") return { error: "password" };
    if (field === "programId" || field === "level") return { error: "program_required" };
    return { error: "invalid" };
  }

  const { name, email, password, programId, level } = parsed.data;
  const next = safeRedirect(formData.get("redirect"));

  try {
    const supabase = createSupabaseServerClient();
    const { data: program } = await supabase.from("programs").select("id").eq("id", programId).maybeSingle();
    if (!program) return { error: "program_required" };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, program_id: programId, level },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${next}`,
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already")) return { error: "exists" };
      return { error: "unavailable" };
    }
    if (!data.session) return { error: "confirm_email" };
  } catch (error) {
    rethrowNavigationError(error);
    return { error: "unavailable" };
  }

  const user = await getCurrentUser();
  redirect(user ? landingPath(user, next) : next);
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    if (field === "email") return { error: "email" };
    if (field === "password") return { error: "password_required" };
    return { error: "invalid" };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) {
      if (error.message.toLowerCase().includes("confirm")) return { error: "confirm_email" };
      return { error: "bad_login" };
    }
  } catch (error) {
    rethrowNavigationError(error);
    return { error: "unavailable" };
  }

  const user = await getCurrentUser();
  redirect(user ? landingPath(user, safeRedirect(formData.get("redirect"))) : safeRedirect(formData.get("redirect")));
}

export async function logoutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
