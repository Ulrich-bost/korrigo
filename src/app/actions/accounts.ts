"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STUDY_LEVELS } from "@/lib/taxonomy";

const DEMO_EMAILS = new Set([
  "superadmin@univ-sujets.fr",
  "admin@univ-sujets.fr",
  "etudiant@univ-sujets.fr",
]);

const scopeSchema = z.object({
  kind: z.enum(["department", "program"]),
  departmentId: z.string().optional(),
  programId: z.string().optional(),
  level: z.string().optional(),
});

function readScopes(formData: FormData) {
  try {
    const parsed = z.array(scopeSchema).safeParse(JSON.parse(String(formData.get("scopes") || "[]")));
    if (!parsed.success) return null;
    return parsed.data.map((scope) => ({
      kind: scope.kind,
      departmentId: scope.departmentId ?? "",
      programId: scope.programId ?? "",
      level: scope.level ?? "",
    }));
  } catch {
    return null;
  }
}

export async function saveAccountAction(_state: { error?: string } | undefined, formData: FormData) {
  try {
    const user = await requireStaff();
    if (user.role !== "super_admin") return { error: "denied" };
  } catch {
    return { error: "denied" };
  }

  const role = formData.get("role");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const id = String(formData.get("id") || "") || null;
  const programId = String(formData.get("programId") || "") || null;
  const level = String(formData.get("level") || "") || null;
  const scopes = readScopes(formData);

  if (!email || name.length < 2 || (role !== "student" && role !== "admin" && role !== "super_admin")) {
    return { error: "invalid" };
  }
  if (DEMO_EMAILS.has(email)) return { error: "denied" };
  if (!id && password.length < 8) return { error: "password" };
  if (id && password.length > 0 && password.length < 8) return { error: "password" };
  if (role === "student" && (!programId || !level || !(STUDY_LEVELS as readonly string[]).includes(level))) {
    return { error: "invalid" };
  }
  if (role === "admin" && (!scopes || scopes.length === 0)) return { error: "invalid" };
  if (scopes === null) return { error: "invalid" };

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("save_account", {
    p_id: id,
    p_email: email,
    p_password: password,
    p_name: name,
    p_role: role,
    p_program: role === "student" ? programId : null,
    p_level: role === "student" ? level : null,
    p_scopes: role === "admin" ? scopes : [],
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("exists")) return { error: "exists" };
    if (message.includes("denied")) return { error: "denied" };
    if (message.includes("invalid")) return { error: "invalid" };
    return { error: "unavailable" };
  }

  revalidatePath("/admin/comptes");
  revalidatePath("/admin");
  redirect("/admin/comptes?saved=1");
}

export async function removeAccountAction(_state: { error?: string } | undefined, formData: FormData) {
  try {
    const user = await requireStaff();
    if (user.role !== "super_admin") return { error: "denied" };
  } catch {
    return { error: "denied" };
  }

  if (formData.get("confirm") !== "on") return { error: "invalid" };
  const id = String(formData.get("id") || "");
  if (!id) return { error: "invalid" };
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("remove_account", { p_id: id });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("denied")) return { error: "denied" };
    if (message.includes("invalid")) return { error: "invalid" };
    return { error: "unavailable" };
  }
  revalidatePath("/admin/comptes");
  revalidatePath("/admin");
  redirect("/admin/comptes?saved=1");
}
