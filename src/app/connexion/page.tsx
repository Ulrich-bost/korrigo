"use client";

import { Suspense } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";
import { useI18n } from "@/components/I18nProvider";
import type { Dict } from "@/i18n/messages";

function errorText(code: string | undefined, errors: Dict["errors"]) {
  if (!code) return null;
  return code in errors ? errors[code as keyof Dict["errors"]] : code;
}

function LoginForm() {
  const { dict } = useI18n();
  const t = dict.auth;
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/espace";
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) =>
      loginAction(formData),
    undefined
  );

  return (
    <div className="card border-t-4 border-t-ai-500 shadow-md">
      <h1 className="text-2xl font-bold text-brand-900">{t.loginTitle}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {t.loginLead}
      </p>
      {searchParams.get("confirmed") === "1" && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {t.confirmed}
        </div>
      )}

      <form action={formAction} className="mt-8 space-y-5">
        {state?.error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorText(state.error, dict.errors)}
          </div>
        )}
        <input type="hidden" name="redirect" value={redirectTo} />
        <div>
          <label htmlFor="email" className="label">{t.email}</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">{t.password}</label>
          <input id="password" name="password" type="password" required className="input" />
        </div>
        <SubmitButton className="w-full" pendingLabel={t.loading}>
          {t.submitLogin}
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t.noAccount}{" "}
        <Link href="/inscription" className="font-medium text-brand-600 hover:underline">
          {t.signup}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="card text-sm text-slate-500">…</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
