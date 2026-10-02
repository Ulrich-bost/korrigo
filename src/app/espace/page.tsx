import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Download, GraduationCap, Layers, Lock } from "lucide-react";
import { getCurrentUser, hasProgramAccess } from "@/lib/auth";
import { getExamCatalog, signedFileUrl, type CatalogExam } from "@/lib/catalog";
import { SubjectCorrection } from "@/components/SubjectCorrection";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getI18n } from "@/i18n/get-i18n";
import { rethrowNavigationError } from "@/lib/navigation-error";

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function StudentSpacePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect=/espace");
  if (user.role !== "student") redirect("/admin");
  if (!user.programId || !user.level) redirect("/compte");

  const { dict } = getI18n();
  const t = dict.space;
  const supabase = createSupabaseServerClient();
  const [{ data: program }, { data: courseRows }] = await Promise.all([
    supabase.from("programs").select("name, departments(name)").eq("id", user.programId).maybeSingle(),
    supabase.from("courses").select("id, name").eq("program_id", user.programId).order("name"),
  ]);

  let exams: CatalogExam[] = [];
  try {
    exams = (await getExamCatalog()).filter(
      (exam) => exam.programId === user.programId && exam.level === user.level
    );
  } catch (error) {
    rethrowNavigationError(error);
  }

  const purchased = new Set<string>();
  if (exams.length > 0) {
    const { data: purchases } = await supabase
      .from("one_time_purchases")
      .select("exam_id")
      .eq("profile_id", user.id);
    for (const row of purchases ?? []) purchased.add(row.exam_id as string);
  }
  const subscribed = hasProgramAccess(user, user.programId);
  const corrections = new Map<string, { body: string | null; fileUrl: string | null }>();
  if (exams.length > 0) {
    const { data: correctionRows } = await supabase
      .from("corrections")
      .select("exam_id, body, file_path")
      .in(
        "exam_id",
        exams.map((exam) => exam.id)
      );
    for (const row of correctionRows ?? []) {
      const exam = exams.find((item) => item.id === row.exam_id);
      const open = !!exam && (exam.isFree || subscribed || purchased.has(exam.id));
      if (!open) continue;
      const body = (row.body as string | null) ?? null;
      const filePath = (row.file_path as string | null) ?? null;
      if (!(body ?? "").trim() && !filePath) continue;
      corrections.set(row.exam_id as string, {
        body,
        fileUrl: filePath ? await signedFileUrl(filePath) : null,
      });
    }
  }

  const subjectFiles = new Map<string, string>();
  for (const exam of exams) {
    const open = exam.isFree || subscribed || purchased.has(exam.id);
    if (!open || !exam.filePath) continue;
    const url = await signedFileUrl(exam.filePath);
    if (url) subjectFiles.set(exam.id, url);
  }

  const courses = courseRows ?? [];
  const known = new Set(courses.map((course) => course.id));
  const groups = [
    ...courses.map((course) => ({
      id: course.id as string,
      name: course.name as string,
      exams: exams.filter((exam) => exam.courseId === course.id),
    })),
    ...(() => {
      const loose = exams.filter((exam) => !exam.courseId || !known.has(exam.courseId));
      return loose.length > 0 ? [{ id: "other", name: t.other, exams: loose }] : [];
    })(),
  ];

  const department = one(program?.departments as { name: string } | { name: string }[] | null);
  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-xl">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-brand-700">
          {department?.name && <span>{department.name}</span>}
          {program?.name && (
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" aria-hidden />
              {program.name}
            </span>
          )}
          {user.level && (
            <span className="inline-flex items-center gap-1.5">
              <Layers className="h-4 w-4" aria-hidden />
              {user.level}
            </span>
          )}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-brand-900">{t.hello(firstName)}</h1>
        <p className="mt-3 text-slate-600">{t.lead}</p>
      </div>

      {groups.length === 0 ? (
        <section className="card mt-10 border-dashed text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <BookOpen className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-brand-900">{t.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">{t.emptyLead}</p>
        </section>
      ) : (
        <div className="mt-10 space-y-8">
          {groups.map((group) => (
            <section key={group.id}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-semibold text-brand-900">{group.name}</h2>
                <span className="text-sm text-slate-500">{t.papers(group.exams.length)}</span>
              </div>
              {group.exams.length === 0 ? (
                <p className="mt-3 flex items-center gap-2 rounded-2xl border border-dashed border-brand-200 bg-white px-4 py-6 text-sm text-slate-500">
                  <BookOpen className="h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                  {t.emptyCourse}
                </p>
              ) : (
                <ul className="mt-3 grid gap-3">
                  {group.exams.map((exam) => {
                    const open = exam.isFree || subscribed || purchased.has(exam.id);
                    const correction = open ? corrections.get(exam.id) : undefined;
                    const subjectFileUrl = open ? subjectFiles.get(exam.id) : undefined;
                    return (
                      <li key={exam.id}>
                        {open ? (
                          <article className="card py-4">
                            <Link href={`/sujets/${exam.slug}`} className="block font-semibold text-brand-900 hover:text-brand-700">
                              {exam.title}
                            </Link>
                            <p className="mt-1 text-sm text-slate-500">
                              {exam.year} · {exam.examType}
                            </p>
                            {subjectFileUrl ? (
                              <a href={subjectFileUrl} className="btn-primary mt-3 inline-flex gap-2">
                                <Download className="h-4 w-4" />
                                {dict.subject.downloadSubject}
                              </a>
                            ) : null}
                            {correction ? (
                              <div className="mt-4 border-t border-brand-100 pt-4">
                                <SubjectCorrection content={correction.body} fileUrl={correction.fileUrl} />
                              </div>
                            ) : null}
                          </article>
                        ) : (
                          <Link href={`/sujets/${exam.slug}`} className="card flex items-center justify-between gap-4 py-4 transition hover:border-brand-300 hover:shadow-md">
                            <span>
                              <span className="block font-semibold text-brand-900">{exam.title}</span>
                              <span className="mt-1 block text-sm text-slate-500">
                                {exam.year} · {exam.examType}
                              </span>
                            </span>
                            <Lock className="h-4 w-4 shrink-0 text-ai-600" aria-hidden />
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
