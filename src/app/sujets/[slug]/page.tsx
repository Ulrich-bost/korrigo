import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Lock, ArrowLeft, Calendar, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hasActiveSubscription } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export default async function SubjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const subject = await prisma.subject.findUnique({
    where: { slug: params.slug },
    include: { university: true },
  });

  if (!subject) notFound();

  await prisma.subject.update({
    where: { id: subject.id },
    data: { views: { increment: 1 } },
  });

  const user = await getCurrentUser();
  const isSubscribed = user ? await hasActiveSubscription(user.id) : false;
  const canAccess = !subject.isPremium || isSubscribed;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/sujets"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au catalogue
      </Link>

      <article className="mt-6 card">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
            {subject.university.name}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
            {subject.examType}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold">{subject.title}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            <Building2 className="h-4 w-4" /> {subject.faculty} — L{subject.level}
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
            <div>
              <h2 className="font-semibold text-slate-900">Contenu du sujet</h2>
              <div className="mt-4 rounded-lg bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-inner">
                <p className="font-medium">Exercice 1 — Analyse (8 points)</p>
                <p className="mt-2">
                  Étudier la convergence de la série ∑ (1/n²) et déterminer sa somme...
                </p>
                <p className="mt-4 font-medium text-brand-700">Correction :</p>
                <p className="mt-2">
                  Il s&apos;agit d&apos;une série de Riemann avec p = 2 &gt; 1, donc convergente.
                  Sa somme vaut π²/6 (Basel).
                </p>
                <p className="mt-6 font-medium">Exercice 2 — Algèbre linéaire (12 points)</p>
                <p className="mt-2">
                  Soit A une matrice 3×3. Déterminer les valeurs propres et diagonaliser A...
                </p>
                <p className="mt-4 font-medium text-brand-700">Correction :</p>
                <p className="mt-2">
                  χ_A(λ) = det(A - λI) = ... Les valeurs propres sont λ₁ = 1, λ₂ = 2, λ₃ = -1.
                </p>
              </div>
              {subject.fileUrl && (
                <a href={subject.fileUrl} className="btn-primary mt-4 inline-flex gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger le PDF
                </a>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Lock className="mx-auto h-12 w-12 text-amber-500" />
              <h2 className="mt-4 text-xl font-semibold">Contenu réservé aux abonnés</h2>
              <p className="mt-2 text-slate-600">
                Abonnez-vous pour accéder à la correction complète et télécharger le PDF.
              </p>
              <Link href="/tarifs" className="btn-primary mt-6 inline-flex">
                Voir les tarifs — dès 9,99 €/mois
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Ajouté le {formatDate(subject.createdAt)} · {subject.views} vues
        </p>
      </article>
    </div>
  );
}
