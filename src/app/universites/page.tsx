import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function UniversitiesPage() {
  const universities = await prisma.university.findMany({
    include: { _count: { select: { subjects: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Universités</h1>
      <p className="mt-2 text-slate-600">
        Parcourez les sujets par établissement
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {universities.map((uni) => (
          <Link
            key={uni.id}
            href={`/sujets?university=${uni.id}`}
            className="card transition hover:border-brand-300 hover:shadow-md"
          >
            <h2 className="font-semibold">{uni.name}</h2>
            {uni.city && (
              <p className="mt-1 text-sm text-slate-500">{uni.city}</p>
            )}
            <p className="mt-3 text-sm font-medium text-brand-600">
              {uni._count.subjects} sujet{uni._count.subjects !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
