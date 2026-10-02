import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminCorrectionForm } from "@/components/AdminCorrectionForm";
import { AdminSubjectFileForm } from "@/components/AdminSubjectFileForm";
import { getCurrentUser } from "@/lib/auth";
import { getExamCatalog, signedFileUrl } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getI18n } from "@/i18n/get-i18n";
import { localizeName } from "@/i18n/catalog-labels";

export default async function AdminSubjectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string; file?: string };
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) redirect("/");

  const { locale, dict } = getI18n();
  const t = dict.admin;
  const subject = (await getExamCatalog()).find((exam) => exam.id === params.id);
  if (!subject) redirect("/admin");

  const supabase = createSupabaseServerClient();
  const { data: correction } = await supabase
    .from("corrections")
    .select("body, file_path")
    .eq("exam_id", subject.id)
    .maybeSingle();
  const correctionFileUrl = correction?.file_path ? await signedFileUrl(correction.file_path) : null;
  const subjectFileUrl = subject.filePath ? await signedFileUrl(subject.filePath) : null;
  const hasCorrection = Boolean((correction?.body ?? "").trim() || correction?.file_path);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin/sujets" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t.navSubjects}
      </Link>

      <header className="mt-6">
        <p className="text-sm font-semibold text-brand-700">{t.manage}</p>
        <h1 className="mt-1 text-3xl font-bold text-brand-900">{subject.title}</h1>
        <p className="mt-2 text-slate-600">
          {localizeName(subject.department, locale)} · {localizeName(subject.faculty, locale)} · {subject.level}
        </p>
        <p className="mt-3">
          <span className={subject.isFree ? "badge-free" : "badge-premium"}>
            {subject.isFree ? t.free : t.paid}
          </span>
        </p>
      </header>

      {searchParams.file && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {t.subjectFileSaved}
        </div>
      )}
      {searchParams.saved && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {t.correctionSaved}
        </div>
      )}

      <section className="card mt-8">
        <h2 className="text-lg font-semibold text-brand-900">{t.subjectFile}</h2>
        {subjectFileUrl ? (
          <p className="mt-3 text-sm text-slate-600">
            {t.subjectFileAttached}{" "}
            <a href={subjectFileUrl} className="font-medium text-brand-700 hover:underline">
              {dict.subject.downloadSubject}
            </a>
          </p>
        ) : (
          <p className="mt-3">
            <span className="badge-ai">{t.correctionMissing}</span>
          </p>
        )}
        <AdminSubjectFileForm examId={subject.id} />
      </section>

      <section className="card mt-8">
        <h2 className="text-lg font-semibold text-brand-900">{t.correction}</h2>
        <p className="mt-1 text-sm text-slate-600">{t.correctionLead}</p>
        {hasCorrection ? (
          <p className="mt-3">
            <span className="badge-free">{t.correctionPresent}</span>
          </p>
        ) : (
          <p className="mt-3">
            <span className="badge-ai">{t.correctionMissing}</span>
          </p>
        )}

        {correction?.body?.trim() ? (
          <div className="mt-4 whitespace-pre-wrap rounded-lg border border-brand-100 bg-brand-50 p-4 text-sm leading-relaxed text-slate-700">
            {correction.body}
          </div>
        ) : null}
        {correctionFileUrl ? (
          <p className="mt-3 text-sm text-slate-600">
            {t.correctionAttached}{" "}
            <a href={correctionFileUrl} className="font-medium text-brand-700 hover:underline">
              {dict.subject.downloadCorrection}
            </a>
          </p>
        ) : null}

        <AdminCorrectionForm examId={subject.id} body={correction?.body ?? ""} />
      </section>
    </div>
  );
}
