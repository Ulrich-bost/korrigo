import Link from "next/link";
import { BookOpen, Download, Search, Shield, Star, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { CATALOG } from "@/lib/taxonomy";
import { getI18n } from "@/i18n/get-i18n";

export default async function HomePage() {
  const session = await getSession();
  const { dict } = getI18n();
  const t = dict.home;
  const structureCount = CATALOG.length;
  const whyIcons = [Search, BookOpen, Download, Shield, Star];

  return (
    <>
      <section className="relative overflow-hidden border-b-4 border-ai-500 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAzNGg2djZoLTZ6TTAgMzRoNnY2SDB6TTAgMzRoNnY2SDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              ✨ {t.badge}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t.title1}<br />{t.title2}
            </h1>
            <p className="mt-6 text-lg text-brand-100 sm:text-xl">
              {t.lead}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {session ? (
                <Link href="/sujets" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-900 shadow-lg transition hover:bg-brand-50">
                  {t.chooseFaculty}
                </Link>
              ) : (
                <Link href="/inscription" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-900 shadow-lg transition hover:bg-brand-50">
                  {t.createAccount}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">{t.howTitle}</h2>
            <p className="mt-3 text-slate-600">{t.howLead}</p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {t.steps.map(({ title, desc }, index) => {
              const step = String(index + 1);
              return (
              <div key={step} className="card">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                  {step}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{desc}</p>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">{t.whyTitle}</h2>
          <p className="mt-3 text-slate-600">{t.whyLead}</p>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ...t.why.map((item, index) => ({ ...item, icon: whyIcons[index] })),
            { icon: Users, title: t.university, desc: t.structures(structureCount) },
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
    </>
  );
}
