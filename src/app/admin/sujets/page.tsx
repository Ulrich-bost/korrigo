import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSubjectForm } from "@/components/AdminSubjectForm";
import { getCurrentUser } from "@/lib/auth";
import { getAcademicTree, getExamCatalog } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getI18n } from "@/i18n/get-i18n";
import { localizeName } from "@/i18n/catalog-labels";
import { levelsForProgram, scopedDepartments } from "@/lib/staff-scope";

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: { created?: string };
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) redirect("/");

  const { locale, dict } = getI18n();
  const t = dict.admin;
  const supabase = createSupabaseServerClient();
  const [tree, exams, correctionResult] = await Promise.all([
    getAcademicTree(),
    getExamCatalog(),
    supabase.from("corrections").select("exam_id, body, file_path"),
  ]);

  const correctionsKnown = !correctionResult.error;
  const correctedIds = new Set(
    ((correctionResult.data ?? []) as { exam_id: string; body: string | null; file_path: string | null }[])
      .filter((row) => Boolean((row.body ?? "").trim() || row.file_path))
      .map((row) => row.exam_id)
  );
  const subjects = [...exams].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const departments = scopedDepartments(tree, user).map((department) => ({
    name: department.name,
    programs: department.programs.map((program) => ({
      name: program.name,
      levels: levelsForProgram(user, department.id, program.id),
    })),
  }));

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold text-brand-900">{t.manage}</h1>
        <p className="mt-2 text-slate-600">{t.publishLead}</p>
      </header>

      {searchParams.created && (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {t.created}
        </div>
      )}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
        <section className="order-2 lg:order-1 lg:col-span-7">
          {subjects.length === 0 ? (
            <p className="rounded-card border border-dashed border-brand-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              {t.emptySubjects}
            </p>
          ) : (
            <div className="max-h-[40rem] overflow-auto rounded-card border border-brand-100 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-brand-100 text-sm">
                <thead className="sticky top-0 bg-brand-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-start font-medium">{t.colTitle}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.colFaculty}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.colFiliere}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.colLevel}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.colFree}</th>
                    <th className="px-4 py-3 text-start font-medium">{t.colCorrection}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-brand-50/60">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/admin/sujets/${subject.id}`} className="text-brand-700 hover:underline">
                          {subject.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{localizeName(subject.department, locale)}</td>
                      <td className="px-4 py-3">{localizeName(subject.faculty, locale)}</td>
                      <td className="px-4 py-3">{subject.level}</td>
                      <td className="px-4 py-3">
                        <span className={subject.isFree ? "badge-free" : "badge-premium"}>
                          {subject.isFree ? t.free : t.paid}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/sujets/${subject.id}`} className="font-medium text-brand-700 hover:underline">
                          {correctionsKnown && correctedIds.has(subject.id) ? t.openCorrection : t.completeCorrection}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <div className="order-1 lg:order-2 lg:col-span-5">
          <AdminSubjectForm departments={departments} />
        </div>
      </div>
    </div>
  );
}
