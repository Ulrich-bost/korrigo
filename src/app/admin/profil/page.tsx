import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { updateStaffPasswordAction, updateStaffProfileAction } from "@/app/actions/account";
import { LogoutZone } from "@/components/LogoutZone";
import { SubmitButton } from "@/components/SubmitButton";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/i18n/get-i18n";

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams: { error?: string; saved?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect=/admin/profil");
  if (user.role !== "admin" && user.role !== "super_admin") redirect("/");

  const { dict } = getI18n();
  const t = dict.admin;
  const account = dict.account;
  const firstName = user.name.split(" ")[0] || user.name;
  const savedMessage = searchParams.saved === "name" ? account.nameSaved : searchParams.saved === "password" ? account.passwordSaved : null;
  const errorMessage =
    searchParams.error && searchParams.error in dict.errors
      ? dict.errors[searchParams.error as keyof typeof dict.errors]
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-ai-600">{t.navProfile}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">{t.hello(firstName)}</h1>
        <p className="mt-2 text-sm text-slate-600">{user.email}</p>
        <p className="mt-3">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800">
            {user.role === "super_admin" ? t.roleSuper : t.roleAdmin}
          </span>
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">{t.profileLead}</p>
      </header>

      {savedMessage && (
        <div role="status" className="mt-6 flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircle className="h-5 w-5" />
          {savedMessage}
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="mt-6 rounded-lg bg-ai-50 px-4 py-3 text-sm text-ai-800">
          {errorMessage}
        </div>
      )}

      <section className="card mt-8 border-brand-200">
        <form action={updateStaffProfileAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="staff-name">{dict.auth.name}</label>
            <input id="staff-name" name="name" required minLength={2} autoComplete="name" className="input" defaultValue={user.name} />
          </div>
          <SubmitButton pendingLabel={dict.auth.loading}>{t.profileSave}</SubmitButton>
        </form>

        <form action={updateStaffPasswordAction} className="mt-8 space-y-4 border-t border-brand-100 pt-6">
          <div>
            <label className="label" htmlFor="staff-password">{dict.auth.password}</label>
            <input id="staff-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
            <p className="mt-1.5 text-xs text-slate-500">{dict.auth.minChars}</p>
          </div>
          <div>
            <label className="label" htmlFor="staff-password-confirm">{account.passwordConfirm}</label>
            <input id="staff-password-confirm" name="passwordConfirm" type="password" required minLength={8} autoComplete="new-password" className="input" />
          </div>
          <SubmitButton variant="secondary" pendingLabel={dict.auth.loading}>{t.profileSave}</SubmitButton>
        </form>
      </section>

      <LogoutZone />
    </div>
  );
}
