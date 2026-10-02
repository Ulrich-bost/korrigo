"use client";

import { useFormState } from "react-dom";
import { saveSubjectFileAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { useI18n } from "@/components/I18nProvider";
import type { Dict } from "@/i18n/messages";

function errorText(code: string | undefined, errors: Dict["errors"]) {
  if (!code) return null;
  return code in errors ? errors[code as keyof Dict["errors"]] : code;
}

export function AdminSubjectFileForm({ examId }: { examId: string }) {
  const { dict } = useI18n();
  const t = dict.admin;
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) => saveSubjectFileAction(formData),
    undefined
  );

  return (
    <form action={formAction} className="mt-4 space-y-4">
      {state?.error && (
        <div className="rounded-lg bg-ai-50 px-3 py-2 text-sm text-ai-700">{errorText(state.error, dict.errors)}</div>
      )}
      <input type="hidden" name="examId" value={examId} />
      <div>
        <label className="label" htmlFor="subject-file-replace">{t.subjectFile}</label>
        <input
          id="subject-file-replace"
          name="subjectFile"
          type="file"
          required
          accept="application/pdf,image/png,image/jpeg,image/webp"
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">{t.subjectFileHint}</p>
      </div>
      <SubmitButton pendingLabel={dict.auth.loading}>{t.subjectFileSave}</SubmitButton>
    </form>
  );
}
