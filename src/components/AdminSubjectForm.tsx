"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createSubjectAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { useI18n } from "@/components/I18nProvider";
import { localizeName } from "@/i18n/catalog-labels";
import type { Dict } from "@/i18n/messages";

export interface AdminProgramOption {
  name: string;
  levels: string[];
}

export interface AdminDepartmentOption {
  name: string;
  programs: AdminProgramOption[];
}

interface Props {
  departments: AdminDepartmentOption[];
}

function errorText(code: string | undefined, errors: Dict["errors"]) {
  if (!code) return null;
  return code in errors ? errors[code as keyof Dict["errors"]] : code;
}

export function AdminSubjectForm({ departments }: Props) {
  const { locale, dict } = useI18n();
  const t = dict.admin;
  const [department, setDepartment] = useState(departments[0]?.name ?? "");
  const programs = departments.find((item) => item.name === department)?.programs ?? [];
  const [program, setProgram] = useState(programs[0]?.name ?? "");
  const levels = programs.find((item) => item.name === program)?.levels ?? [];
  const [level, setLevel] = useState(levels[0] ?? "L1");
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) =>
      createSubjectAction(formData),
    undefined
  );

  function onDepartment(next: string) {
    const nextPrograms = departments.find((item) => item.name === next)?.programs ?? [];
    setDepartment(next);
    setProgram(nextPrograms[0]?.name ?? "");
    setLevel(nextPrograms[0]?.levels[0] ?? "L1");
  }

  function onProgram(next: string) {
    const nextLevels = programs.find((item) => item.name === next)?.levels ?? [];
    setProgram(next);
    setLevel(nextLevels[0] ?? "L1");
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-brand-900">{t.add}</h2>
      <p className="mt-1 text-sm text-slate-600">{t.publishLead}</p>
      <form action={formAction} className="mt-6 space-y-6">
        {state?.error && (
          <div className="rounded-lg bg-ai-50 px-3 py-2 text-sm text-ai-700">{errorText(state.error, dict.errors)}</div>
        )}

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-brand-800">{t.subjectSection}</h3>
          <div>
            <label className="label" htmlFor="subject-title">{t.titleField}</label>
            <input id="subject-title" name="title" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="subject-description">{t.description}</label>
            <textarea id="subject-description" name="description" rows={2} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="subject-department">{t.faculty}</label>
            <select
              id="subject-department"
              name="department"
              required
              className="input"
              value={department}
              onChange={(event) => onDepartment(event.target.value)}
            >
              {departments.map((item) => (
                <option key={item.name} value={item.name}>
                  {localizeName(item.name, locale)}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">{t.namesStayFrench}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="subject-program">{t.filiere}</label>
              <select
                id="subject-program"
                name="faculty"
                required
                className="input"
                value={program}
                onChange={(event) => onProgram(event.target.value)}
              >
                {programs.map((item) => (
                  <option key={item.name} value={item.name}>
                    {localizeName(item.name, locale)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="subject-level">{t.level}</label>
              <select
                id="subject-level"
                name="level"
                required
                className="input"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                {levels.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="subject-year">{t.year}</label>
              <input id="subject-year" name="year" type="number" required defaultValue={2025} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="subject-semester">{t.semester}</label>
              <input id="subject-semester" name="semester" placeholder={t.semesterPlaceholder} className="input" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="subject-exam-type">{t.examType}</label>
            <input id="subject-exam-type" name="examType" required placeholder={t.examPlaceholder} className="input" />
          </div>
          <fieldset>
            <legend className="label">{t.accessChoice}</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-brand-900 has-[:checked]:border-brand-700 has-[:checked]:bg-brand-50">
                <input type="radio" name="isFree" value="true" className="accent-brand-700" />
                {t.free}
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-brand-900 has-[:checked]:border-ai-600 has-[:checked]:bg-ai-50">
                <input type="radio" name="isFree" value="false" defaultChecked className="accent-ai-600" />
                {t.paid}
              </label>
            </div>
          </fieldset>
          <div>
            <label className="label" htmlFor="subject-file">{t.subjectFile}</label>
            <input
              id="subject-file"
              name="subjectFile"
              type="file"
              required
              accept="application/pdf,image/png,image/jpeg,image/webp"
              className="input"
            />
            <p className="mt-1 text-xs text-slate-500">{t.subjectFileHint}</p>
          </div>
        </section>

        <section className="rounded-xl border border-brand-200 bg-brand-50 p-4">
          <h3 className="text-sm font-semibold text-brand-800">{t.correction}</h3>
          <p className="mt-1 text-sm text-slate-600">{t.correctionLead}</p>
          <label className="label mt-3" htmlFor="subject-correction">{t.content}</label>
          <textarea
            id="subject-correction"
            name="content"
            rows={6}
            className="input bg-white"
            placeholder={t.contentPlaceholder}
          />
          <label className="label mt-4" htmlFor="correction-file">{t.correctionFile}</label>
          <input
            id="correction-file"
            name="correctionFile"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            className="input bg-white"
          />
          <p className="mt-1 text-xs text-slate-500">{t.correctionFileHint}</p>
        </section>

        <SubmitButton className="w-full" pendingLabel={dict.auth.loading}>{t.publish}</SubmitButton>
      </form>
    </div>
  );
}
