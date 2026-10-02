import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Building2, Download, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { canAccessExam } from "@/lib/access";
import { getCorrection, getExamBySlug, signedFileUrl } from "@/lib/catalog";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import { departmentSlug, filiereSlug, formatLevel } from "@/lib/taxonomy";
import { formatDate } from "@/lib/utils";
import { SubjectCorrection } from "@/components/SubjectCorrection";
import { Paywall } from "@/components/Paywall";
import { rethrowNavigationError } from "@/lib/navigation-error";
import { getI18n } from "@/i18n/get-i18n";
import { localizeName } from "@/i18n/catalog-labels";

export default async function SubjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let subject;
  try {
    subject = await getExamBySlug(params.slug);
  } catch (error) {
    rethrowNavigationError(error);
    const { dict } = getI18n();
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-500">
        {dict.subject.unavailable}
      </div>
    );
  }

  if (!subject) notFound();

  try {
    const supabase = createSupabasePublicClient();
    await supabase.rpc("register_exam_view", { exam_slug: subject.slug });
  } catch (error) {
    rethrowNavigationError(error);
  }

  const { locale, dict } = getI18n();
  const t = dict.subject;
  const user = await getCurrentUser();
  const canAccess = await canAccessExam(subject.id, user?.id ?? null);
  const correction = canAccess ? await getCorrection(subject.id) : null;
  const subjectFileUrl = canAccess ? await signedFileUrl(subject.filePath) : null;
  const correctionFileUrl = canAccess ? await signedFileUrl(correction?.file_path ?? null) : null;
  const backHref =
    user?.role === "student" && user.programId
      ? "/espace"
      : `/sujets?departement=${departmentSlug(subject.department)}&filiere=${filiereSlug(subject.faculty)}&niveau=${subject.level}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {user?.role === "student" && user.programId ? dict.nav.exams : t.back}
      </Link>

      <article className="mt-6 card border-t-4 border-t-brand-700">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
            {localizeName(subject.department, locale)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {localizeName(subject.faculty, locale)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {formatLevel(subject.level)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {subject.examType}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-brand-900">{subject.title}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Building2 className="h-4 w-4" /> {localizeName(subject.department, locale)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {dict.catalog.session(subject.year)}
            {subject.semester ? ` · ${subject.semester}` : ""}
          </span>
        </div>

        {subject.description && (
          <p className="mt-6 text-slate-600 leading-relaxed">{subject.description}</p>
        )}

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          {canAccess ? (
            <div className="space-y-4">
              {subjectFileUrl ? (
                <a href={subjectFileUrl} className="btn-primary inline-flex gap-2">
                  <Download className="h-4 w-4" />
                  {t.downloadSubject}
                </a>
              ) : null}
              <SubjectCorrection content={correction?.body} fileUrl={correctionFileUrl} />
            </div>
          ) : !user ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold">{t.createTitle}</h2>
              <p className="mt-2 text-slate-600">
                {t.createLead}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/inscription?redirect=${encodeURIComponent(`/sujets/${subject.slug}`)}`}
                  className="btn-primary"
                >
                  {t.createAccount}
                </Link>
                <Link
                  href={`/connexion?redirect=${encodeURIComponent(`/sujets/${subject.slug}`)}`}
                  className="btn-secondary"
                >
                  {t.login}
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex justify-center text-ai-600">
                <Lock className="h-6 w-6" aria-hidden />
              </div>
              <Paywall loggedIn examId={subject.id} />
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          {t.added(formatDate(subject.createdAt, locale), subject.views)}
        </p>
      </article>
    </div>
  );
}
