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

export interface AdminScope {
  departmentId: string | null;
  departmentName: string;
  programId: string | null;
  programName: string | null;
  level: string | null;
}

export interface CurrentUser extends SessionUser {
  programId: string | null;
  level: string | null;
  objectives: string | null;
  subscriptions: UserSubscription[];
  scopes: AdminScope[];
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

    const [{ data: profile }, { data: subscriptions }, { data: scopes }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, role, program_id, level, objectives")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("program_id, plan, status, current_period_end")
        .eq("profile_id", user.id),
      supabase
        .from("admin_scopes")
        .select("department_id, program_id, level, departments(name), programs(name, department_id, departments(name))")
        .eq("profile_id", user.id),
    ]);

    const role = (profile?.role as AppRole) ?? "student";
    const isStudent = role === "student";

    return {
      id: user.id,
      email: user.email ?? "",
      name: profile?.full_name || user.email || "",
      role,
      programId: isStudent ? profile?.program_id ?? null : null,
      level: isStudent ? profile?.level ?? null : null,
      objectives: isStudent ? profile?.objectives ?? null : null,
      subscriptions: isStudent
        ? (subscriptions ?? []).map((row) => ({
            programId: row.program_id as string,
            plan: row.plan as "monthly" | "yearly",
            status: row.status as string,
            currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : null,
          }))
        : [],
      scopes: (scopes ?? []).map((scope) => {
        const department = Array.isArray(scope.departments) ? scope.departments[0] : scope.departments;
        const program = Array.isArray(scope.programs) ? scope.programs[0] : scope.programs;
        const programDepartment = program
          ? Array.isArray(program.departments)
            ? program.departments[0]
            : program.departments
          : null;
        return {
          departmentId: (scope.department_id as string | null) ?? (program?.department_id as string | null) ?? null,
          departmentName:
            (department as { name?: string } | null)?.name ??
            (programDepartment as { name?: string } | null)?.name ??
            "",
          programId: (scope.program_id as string | null) ?? null,
          programName: program?.name ?? null,
          level: (scope.level as string | null) ?? null,
        };
      }),
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
  if (!user || user.role !== "student") return false;
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

export function landingPath(user: CurrentUser, requested: string) {
  if (user.role !== "student") {
    if (requested === "/espace" || requested === "/sujets" || requested === "/") return "/admin";
    return requested;
  }
  if (!user.programId || !user.level) return "/compte";
  if (requested.startsWith("/sujets/")) return requested;
  return "/espace";
}
