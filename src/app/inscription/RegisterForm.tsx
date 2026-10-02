"use client";

import { Suspense, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { useI18n } from "@/components/I18nProvider";
import type { AcademicDepartment } from "@/lib/catalog";
import { STUDY_LEVELS } from "@/lib/taxonomy";
import type { Dict } from "@/i18n/messages";

function errorText(code: string | undefined, errors: Dict["errors"]) {
  if (!code) return null;
  return code in errors ? errors[code as keyof Dict["errors"]] : code;
}

function RegisterFormFields({ tree }: { tree: AcademicDepartment[] }) {
  const { dict } = useI18n();
  const t = dict.auth;
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/espace";
  const [departmentId, setDepartmentId] = useState("");
  const [programId, setProgramId] = useState("");
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) => registerAction(formData),
    undefined
  );

  const programs = useMemo(
    () => tree.find((department) => department.id === departmentId)?.programs ?? [],
    [tree, departmentId]
  );

  return (
    <div className="card border-t-4 border-t-ai-500 shadow-md">
      <h1 className="text-2xl font-bold text-brand-900">{t.signupTitle}</h1>
      <p className="mt-2 text-sm text-slate-600">{t.signupLead}</p>

      <form action={formAction} className="mt-8 space-y-5">
        {state?.error && (
          <div className="rounded-lg bg-ai-50 px-4 py-3 text-sm text-ai-700">
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
        <div>
          <label htmlFor="department" className="label">{dict.admin.faculty}</label>
          <select
            id="department"
            required
            className="input"
            value={departmentId}
            onChange={(event) => {
              setDepartmentId(event.target.value);
              setProgramId("");
            }}
          >
            <option value="" disabled>
              {dict.catalog.chooseFaculty}
            </option>
            {tree.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="programId" className="label">{dict.admin.filiere}</label>
          <select
            id="programId"
            name="programId"
            required
            className="input"
            value={programId}
            disabled={!departmentId}
            onChange={(event) => setProgramId(event.target.value)}
          >
            <option value="" disabled>
              {dict.catalog.chooseFiliere}
            </option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="level" className="label">{dict.admin.level}</label>
          <select id="level" name="level" required className="input" defaultValue="L1">
            {STUDY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">{dict.space.levelHint}</p>
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

export function RegisterForm({ tree }: { tree: AcademicDepartment[] }) {
  return (
    <Suspense fallback={<div className="card text-sm text-slate-500">…</div>}>
      <RegisterFormFields tree={tree} />
    </Suspense>
  );
}
