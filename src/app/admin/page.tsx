import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminSubjectForm } from "@/components/AdminSubjectForm";
import { CATALOG } from "@/lib/taxonomy";
import { getI18n } from "@/i18n/get-i18n";
import { localizeName } from "@/i18n/catalog-labels";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { created?: string };
}) {
  const { locale, dict } = getI18n();
  const t = dict.admin;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const [subjects, userCount] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.user.count(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <p className="mt-2 text-slate-600">
        {t.summary(subjects.length, CATALOG.length, userCount)}
      </p>

      {searchParams.created && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {t.created}
        </div>
      )}

      <div className="mt-10 max-w-xl">
        <AdminSubjectForm departments={CATALOG.map((item) => item.name)} />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">{t.latest}</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t.colTitle}</th>
                <th className="px-4 py-3 text-start font-medium">{t.colFaculty}</th>
                <th className="px-4 py-3 text-start font-medium">{t.colFiliere}</th>
                <th className="px-4 py-3 text-start font-medium">{t.colLevel}</th>
                <th className="px-4 py-3 text-start font-medium">{t.colFree}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link href={`/sujets/${s.slug}`} className="text-brand-600 hover:underline">
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{localizeName(s.department, locale)}</td>
                  <td className="px-4 py-3">{localizeName(s.faculty, locale)}</td>
                  <td className="px-4 py-3">{s.level}</td>
                  <td className="px-4 py-3">{s.isPremium ? t.no : t.yes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
