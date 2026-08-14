import Link from "next/link";
import { Lock, FileText, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasActiveSubscription } from "@/lib/auth";
import { SubjectFilters } from "@/components/SubjectFilters";

interface SearchParams {
  q?: string;
  university?: string;
  faculty?: string;
  year?: string;
}

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  const isSubscribed = user ? await hasActiveSubscription(user.id) : false;

  const where: Record<string, unknown> = {};
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { description: { contains: searchParams.q } },
      { faculty: { contains: searchParams.q } },
    ];
  }
  if (searchParams.university) where.universityId = searchParams.university;
  if (searchParams.faculty) where.faculty = searchParams.faculty;
  if (searchParams.year) where.year = parseInt(searchParams.year, 10);

  const [subjects, universities, faculties] = await Promise.all([
    prisma.subject.findMany({
      where,
      include: { university: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.university.findMany({ orderBy: { name: "asc" } }),
    prisma.subject.findMany({
      select: { faculty: true },
      distinct: ["faculty"],
      orderBy: { faculty: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catalogue des sujets</h1>
          <p className="mt-2 text-slate-600">
            {subjects.length} sujet{subjects.length !== 1 ? "s" : ""} disponible{subjects.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!isSubscribed && (
          <Link href="/tarifs" className="btn-primary">
            Débloquer tout — à partir de 9,99 €/mois
          </Link>
        )}
      </div>

      <SubjectFilters
        universities={universities}
        faculties={faculties.map((f) => f.faculty)}
        current={searchParams}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => {
          const locked = subject.isPremium && !isSubscribed;
          return (
            <Link
              key={subject.id}
              href={`/sujets/${subject.slug}`}
              className="card group transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  {subject.university.name}
                </span>
                {locked ? (
                  <Lock className="h-4 w-4 text-amber-500" />
                ) : (
                  <FileText className="h-4 w-4 text-brand-500" />
                )}
              </div>
              <h2 className="mt-3 font-semibold group-hover:text-brand-700">
                {subject.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {subject.faculty} · L{subject.level} · {subject.year}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {subject.description}
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {subject.views}
                </span>
                <span>{subject.examType}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="mt-12 text-center text-slate-500">
          Aucun sujet trouvé. Essayez d&apos;autres filtres.
        </div>
      )}
    </div>
  );
}
