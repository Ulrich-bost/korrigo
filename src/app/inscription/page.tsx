"use client";

import { Suspense } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { useI18n } from "@/components/I18nProvider";
import type { Dict } from "@/i18n/messages";

function errorText(code: string | undefined, errors: Dict["errors"]) {
  if (!code) return null;
  return code in errors ? errors[code as keyof Dict["errors"]] : code;
}

function RegisterForm() {
  const { dict } = useI18n();
  const t = dict.auth;
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/sujets";
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) =>
      registerAction(formData),
    undefined
  );

  return (
    <div className="card">
      <h1 className="text-2xl font-bold">{t.signupTitle}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {t.signupLead}
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        {state?.error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorText(state.error, dict.errors)}
          </div>
        )}
        <input type="hidden" name="redirect" value={redirectTo} />
        <div>
          <label htmlFor="name" className="label">{t.name}</label>
          <input id="name" name="name" type="text" required className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">{t.email}</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">{t.password}</label>
          <input id="password" name="password" type="password" required minLength={8} className="input" />
          <p className="mt-1 text-xs text-slate-500">{t.minChars}</p>
        </div>
        <button type="submit" className="btn-primary w-full">
          {t.submitSignup}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t.hasAccount}{" "}
        <Link href="/connexion" className="font-medium text-brand-600 hover:underline">
          {t.login}
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Suspense fallback={<div className="card text-sm text-slate-500">…</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
