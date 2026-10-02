import { redirect } from "next/navigation";
import { AdminAccounts, type ManagedAccount } from "@/components/AdminAccounts";
import { getCurrentUser } from "@/lib/auth";
import { getAcademicTree } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getI18n } from "@/i18n/get-i18n";

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) redirect("/");
  if (user.role !== "super_admin") redirect("/admin");

  const { dict } = getI18n();
  const t = dict.admin;
  const supabase = createSupabaseServerClient();
  const [tree, profileResult, scopeResult] = await Promise.all([
    getAcademicTree(),
    supabase.from("profiles").select("id, full_name, email, role, program_id, level").order("full_name"),
    supabase.from("admin_scopes").select("profile_id, department_id, program_id, level"),
  ]);

  const scopesByProfile = new Map<string, ManagedAccount["scopes"]>();
  for (const scope of scopeResult.data ?? []) {
    const list = scopesByProfile.get(scope.profile_id as string) ?? [];
    list.push(
      scope.program_id
        ? {
            kind: "program",
            departmentId: "",
            programId: scope.program_id as string,
            level: (scope.level as string) ?? "L1",
          }
        : {
            kind: "department",
            departmentId: (scope.department_id as string) ?? "",
            programId: "",
            level: "",
          }
    );
    scopesByProfile.set(scope.profile_id as string, list);
  }

  const accounts: ManagedAccount[] = (profileResult.data ?? []).map((profile) => ({
    id: profile.id as string,
    name: profile.full_name as string,
    email: profile.email as string,
    role: profile.role as ManagedAccount["role"],
    programId: (profile.program_id as string | null) ?? null,
    level: (profile.level as string | null) ?? null,
    scopes: scopesByProfile.get(profile.id as string) ?? [],
  }));

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold text-brand-900">{t.accountsTitle}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">{t.accountsManageLead}</p>
      </header>
      {searchParams.saved && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {t.accountSaved}
        </div>
      )}
      <div className="mt-8">
        <AdminAccounts
          tree={tree.map((department) => ({
            id: department.id,
            name: department.name,
            programs: department.programs.map((program) => ({ id: program.id, name: program.name })),
          }))}
          accounts={accounts}
        />
      </div>
    </div>
  );
}
