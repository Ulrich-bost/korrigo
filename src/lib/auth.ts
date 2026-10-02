import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rethrowNavigationError } from "@/lib/navigation-error";

export type AppRole = "student" | "admin" | "super_admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
}

export interface UserSubscription {
  programId: string;
  plan: "monthly" | "yearly";
  status: string;
  currentPeriodEnd: Date | null;
}

export interface CurrentUser extends SessionUser {
  programId: string | null;
  level: string | null;
  objectives: string | null;
  subscriptions: UserSubscription[];
}

function isActive(sub: UserSubscription) {
  return sub.status === "active" && (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const [{ data: profile }, { data: subscriptions }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, role, program_id, level, objectives")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("program_id, plan, status, current_period_end")
        .eq("profile_id", user.id),
    ]);

    return {
      id: user.id,
      email: user.email ?? "",
      name: profile?.full_name || user.email || "",
      role: (profile?.role as AppRole) ?? "student",
      programId: profile?.program_id ?? null,
      level: profile?.level ?? null,
      objectives: profile?.objectives ?? null,
      subscriptions: (subscriptions ?? []).map((row) => ({
        programId: row.program_id as string,
        plan: row.plan as "monthly" | "yearly",
        status: row.status as string,
        currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : null,
      })),
    };
  } catch (error) {
    rethrowNavigationError(error);
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export function hasProgramAccess(user: CurrentUser | null, programId: string) {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.subscriptions.some((sub) => sub.programId === programId && isActive(sub));
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireStaff() {
  const user = await requireAuth();
  if (user.role !== "admin" && user.role !== "super_admin") throw new Error("FORBIDDEN");
  return user;
}
