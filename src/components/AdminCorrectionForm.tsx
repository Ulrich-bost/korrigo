"use client";

import { useFormState } from "react-dom";
import { saveCorrectionAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { useI18n } from "@/components/I18nProvider";
import type { Dict } from "@/i18n/messages";

function errorText(code: string | undefined, errors: Dict["errors"]) {
  if (!code) return null;
  return code in errors ? errors[code as keyof Dict["errors"]] : code;
}

export function AdminCorrectionForm({ examId, body }: { examId: string; body: string }) {
  const { dict } = useI18n();
  const t = dict.admin;
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) => saveCorrectionAction(formData),
    undefined
  );

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
      {state?.error && (
        <div className="rounded-lg bg-ai-50 px-3 py-2 text-sm text-ai-700">{errorText(state.error, dict.errors)}</div>
      )}
      <input type="hidden" name="examId" value={examId} />
      <div>
        <label className="label" htmlFor="correction-body">{t.content}</label>
        <textarea
          id="correction-body"
          name="content"
          rows={8}
          className="input bg-white"
          placeholder={t.contentPlaceholder}
          defaultValue={body}
        />
      </div>
      <div>
        <label className="label" htmlFor="correction-file">{t.correctionFile}</label>
        <input
          id="correction-file"
          name="correctionFile"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          className="input bg-white"
        />
        <p className="mt-1 text-xs text-slate-500">{t.correctionFileHint}</p>
      </div>
      <SubmitButton pendingLabel={dict.auth.loading}>{t.publish}</SubmitButton>
    </form>
  );
}
