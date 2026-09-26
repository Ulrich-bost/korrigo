import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { canAccessSubject } from "@/lib/access";
import { departmentSlug, filiereSlug, formatLevel } from "@/lib/taxonomy";
import { formatDate } from "@/lib/utils";
import { SubjectCorrection } from "@/components/SubjectCorrection";
import { Paywall } from "@/components/Paywall";
import { rethrowNavigationError } from "@/lib/navigation-error";

export default async function SubjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let subject;
  try {
    subject = await prisma.subject.findUnique({
      where: { slug: params.slug },
    });
  } catch (error) {
    rethrowNavigationError(error);
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center text-slate-500">
        Ce sujet est momentanément indisponible. Réessayez dans quelques minutes.
      </div>
    );
  }

  if (!subject) notFound();

  try {
    await prisma.subject.update({
      where: { id: subject.id },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    rethrowNavigationError(error);
  }

  const user = await getCurrentUser();
  const canAccess = await canAccessSubject(subject, user?.id ?? null);
  const backHref = `/sujets?departement=${departmentSlug(subject.department)}&filiere=${filiereSlug(subject.faculty)}&niveau=${subject.level}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au catalogue
      </Link>

      <article className="mt-6 card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
            {subject.department}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {subject.faculty}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {formatLevel(subject.level)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {subject.examType}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold">{subject.title}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Building2 className="h-4 w-4" /> {subject.department}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Session {subject.year}
            {subject.semester ? ` · ${subject.semester}` : ""}
          </span>
        </div>

        {subject.description && (
          <p className="mt-6 text-slate-600 leading-relaxed">{subject.description}</p>
        )}

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
          {canAccess ? (
            <SubjectCorrection content={subject.content} fileUrl={subject.fileUrl} />
          ) : !user ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold">Créez un compte pour continuer</h2>
              <p className="mt-2 text-slate-600">
                Choisissez ensuite votre faculté et votre filière pour consulter les corrigés.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href={`/inscription?redirect=${encodeURIComponent(`/sujets/${subject.slug}`)}`}
                  className="btn-primary"
                >
                  Créer un compte
                </Link>
                <Link
                  href={`/connexion?redirect=${encodeURIComponent(`/sujets/${subject.slug}`)}`}
                  className="btn-secondary"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          ) : (
            <Paywall loggedIn />
          )}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Ajouté le {formatDate(subject.createdAt)} · {subject.views} vues
        </p>
      </article>
    </div>
  );
}
