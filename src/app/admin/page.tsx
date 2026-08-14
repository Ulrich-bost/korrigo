import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminSubjectForm } from "@/components/AdminSubjectForm";
import { AdminUniversityForm } from "@/components/AdminUniversityForm";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { created?: string; uni?: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const [subjects, universities, userCount] = await Promise.all([
    prisma.subject.findMany({
      include: { university: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.university.findMany({ orderBy: { name: "asc" } }),
    prisma.user.count(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Administration</h1>
      <p className="mt-2 text-slate-600">
        {subjects.length} sujets · {universities.length} universités · {userCount} utilisateurs
      </p>

      {(searchParams.created || searchParams.uni) && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {searchParams.created ? "Sujet ajouté avec succès." : "Université ajoutée avec succès."}
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <AdminSubjectForm universities={universities} />
        <AdminUniversityForm />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Derniers sujets</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Titre</th>
                <th className="px-4 py-3 text-left font-medium">Université</th>
                <th className="px-4 py-3 text-left font-medium">Année</th>
                <th className="px-4 py-3 text-left font-medium">Premium</th>
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
                  <td className="px-4 py-3">{s.university.name}</td>
                  <td className="px-4 py-3">{s.year}</td>
                  <td className="px-4 py-3">{s.isPremium ? "Oui" : "Non"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
