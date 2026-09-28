"use client";

import { useFormState } from "react-dom";
import { createSubjectAction } from "@/app/actions/admin";
import { STUDY_LEVELS } from "@/lib/taxonomy";
import { useI18n } from "@/components/I18nProvider";
import type { Dict } from "@/i18n/messages";

interface Props {
  departments: string[];
}

function errorText(code: string | undefined, errors: Dict["errors"]) {
  if (!code) return null;
  return code in errors ? errors[code as keyof Dict["errors"]] : code;
}

export function AdminSubjectForm({ departments }: Props) {
  const { dict } = useI18n();
  const t = dict.admin;
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) =>
      createSubjectAction(formData),
    undefined
  );

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">{t.add}</h2>
      <form action={formAction} className="mt-6 space-y-4">
        {state?.error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorText(state.error, dict.errors)}</div>
        )}
        <div>
          <label className="label">{t.titleField}</label>
          <input name="title" required className="input" />
        </div>
        <div>
          <label className="label">{t.description}</label>
          <textarea name="description" rows={2} className="input" />
        </div>
        <div>
          <label className="label">{t.content}</label>
          <textarea name="content" rows={6} className="input" placeholder={t.contentPlaceholder} />
        </div>
        <div>
          <label className="label">{t.faculty}</label>
          <input
            name="department"
            required
            list="departments"
            placeholder={t.facultyPlaceholder}
            className="input"
          />
          <p className="mt-1 text-xs text-slate-500">{t.namesStayFrench}</p>
          <datalist id="departments">
            {departments.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t.filiere}</label>
            <input name="faculty" required placeholder={t.filierePlaceholder} className="input" />
          </div>
          <div>
            <label className="label">{t.level}</label>
            <select name="level" required className="input" defaultValue="L1">
              {STUDY_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t.year}</label>
            <input name="year" type="number" required defaultValue={2025} className="input" />
          </div>
          <div>
            <label className="label">{t.semester}</label>
            <input name="semester" placeholder={t.semesterPlaceholder} className="input" />
          </div>
        </div>
        <div>
          <label className="label">{t.examType}</label>
          <input name="examType" required placeholder={t.examPlaceholder} className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input name="isPremium" type="checkbox" defaultChecked className="rounded" />
          {t.premium}
        </label>
        <button type="submit" className="btn-primary w-full">{t.publish}</button>
      </form>
    </div>
  );
}
