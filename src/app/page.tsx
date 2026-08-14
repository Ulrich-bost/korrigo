import Link from "next/link";
import { BookOpen, Download, Search, Shield, Star, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  let subjectCount = 0;
  let universityCount = 0;

  try {
    [subjectCount, universityCount] = await Promise.all([
      prisma.subject.count(),
      prisma.university.count(),
    ]);
  } catch {
    // Base de données non initialisée
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAzNGg2djZoLTZ6TTAgMzRoNnY2SDB6TTAgMzRoNnY2SDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              +{subjectCount} sujets corrigés disponibles
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Tous les sujets corrigés de l&apos;université, en un seul endroit
            </h1>
            <p className="mt-6 text-lg text-brand-100 sm:text-xl">
              Préparez vos examens avec des annales corrigées de {universityCount}+ universités.
              Abonnement flexible : mensuel ou annuel.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/inscription" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-lg transition hover:bg-brand-50">
                Commencer gratuitement
              </Link>
              <Link href="/sujets" className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                Explorer le catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Pourquoi UnivSujets ?</h2>
          <p className="mt-3 text-slate-600">Tout ce dont vous avez besoin pour réussir vos examens</p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Search, title: "Recherche avancée", desc: "Filtrez par université, filière, année et type d'examen." },
            { icon: BookOpen, title: "Corrigés détaillés", desc: "Chaque sujet inclut la correction complète et commentée." },
            { icon: Download, title: "Téléchargement PDF", desc: "Emportez vos sujets partout, même hors connexion." },
            { icon: Shield, title: "Contenu vérifié", desc: "Sujets validés par des enseignants et étudiants." },
            { icon: Star, title: "Mises à jour régulières", desc: "Nouveaux sujets ajoutés chaque semaine." },
            { icon: Users, title: "Communauté active", desc: "Des milliers d'étudiants nous font confiance." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Choisissez votre formule</h2>
            <p className="mt-3 text-slate-600">Sans engagement — résiliez quand vous voulez</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
            <div className="card">
              <h3 className="text-lg font-semibold">Mensuel</h3>
              <p className="mt-4">
                <span className="text-4xl font-bold">9,99 €</span>
                <span className="text-slate-500">/mois</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                <li>✓ Accès illimité aux sujets</li>
                <li>✓ Téléchargements PDF</li>
                <li>✓ Nouveaux sujets chaque semaine</li>
              </ul>
              <Link href="/tarifs" className="btn-primary mt-8 w-full">
                Choisir mensuel
              </Link>
            </div>
            <div className="card relative border-brand-500 ring-2 ring-brand-500">
              <span className="absolute -top-3 right-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                Économisez 33%
              </span>
              <h3 className="text-lg font-semibold">Annuel</h3>
              <p className="mt-4">
                <span className="text-4xl font-bold">79,99 €</span>
                <span className="text-slate-500">/an</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                <li>✓ Tout le plan mensuel</li>
                <li>✓ 2 mois offerts</li>
                <li>✓ Support prioritaire</li>
              </ul>
              <Link href="/tarifs" className="btn-primary mt-8 w-full">
                Choisir annuel
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
