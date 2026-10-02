import { Download } from "lucide-react";
import { getI18n } from "@/i18n/get-i18n";

export function SubjectCorrection({
  content,
  fileUrl,
}: {
  content?: string | null;
  fileUrl?: string | null;
}) {
  const { dict } = getI18n();
  const text = content?.trim() ?? "";
  if (!text && !fileUrl) {
    return <p className="text-sm text-slate-600">{dict.subject.noCorrection}</p>;
  }

  return (
    <div>
      <h2 className="font-semibold text-brand-900">{dict.subject.heading}</h2>
      {text ? (
        <div className="mt-4 whitespace-pre-wrap rounded-lg bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-inner">
          {text}
        </div>
      ) : null}
      {fileUrl ? (
        <a href={fileUrl} className="btn-secondary mt-4 inline-flex gap-2">
          <Download className="h-4 w-4" />
          {dict.subject.downloadCorrection}
        </a>
      ) : null}
    </div>
  );
}
