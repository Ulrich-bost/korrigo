import Link from "next/link";
import { ArrowRight, BookOpen, Download, Search, Shield, Star, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { CATALOG } from "@/lib/taxonomy";
import { getI18n } from "@/i18n/get-i18n";

export default async function HomePage() {
  const session = await getCurrentUser();
  const { dict } = getI18n();
  const t = dict.home;
  const nav = dict.nav;
  const homeHref = !session ? "/inscription" : session.role === "student" ? "/espace" : "/admin";
  const homeLabel = !session ? t.createAccount : session.role === "student" ? nav.exams : nav.admin;
  const structureCount = CATALOG.length;
  const whyIcons = [Search, BookOpen, Download, Shield, Star, Users];
  const reasons = [
    ...t.why.map((item, index) => ({ ...item, icon: whyIcons[index] })),
    { icon: Users, title: t.university, desc: t.structures(structureCount) },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-brand-100 bg-white">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-ai-500" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-800">
              {t.badge}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              {t.title1}
              <span className="mt-2 block text-brand-700">{t.title2}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">{t.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={homeHref} className="btn-primary px-6 py-3">
                {homeLabel}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
              {!session && (
                <Link href="/connexion" className="btn-secondary px-6 py-3">
                  {nav.login}
                </Link>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-4 top-8 h-28 w-28 rounded-full bg-ai-100" />
            <div className="absolute -right-3 bottom-6 h-24 w-24 rounded-full bg-brand-100" />
            <div className="relative rounded-3xl border border-brand-100 bg-brand-900 p-6 text-white shadow-xl sm:p-8">
              <p className="text-sm font-medium text-brand-100">{t.university}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{t.structures(structureCount)}</p>
              <ol className="mt-8 space-y-3">
                {t.steps.map((step, index) => (
                  <li key={step.title} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ai-500 text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{step.title}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-ai-600">{t.howLead}</p>
            <h2 className="mt-2 text-3xl font-bold text-brand-900">{t.howTitle}</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.steps.map(({ title, desc }, index) => (
              <article key={title} className="card relative overflow-hidden">
                <span className="text-5xl font-bold text-brand-100">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-semibold text-brand-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-brand-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-brand-900">{t.whyTitle}</h2>
            <p className="mt-3 text-slate-600">{t.whyLead}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map(({ icon: Icon, title, desc }, index) => (
              <article
                key={title}
                className={`card transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md ${index === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-brand-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-800 px-8 py-10 text-white sm:flex-row sm:items-center sm:px-12">
          <div>
            <h2 className="text-2xl font-bold">{t.title1}</h2>
            <p className="mt-2 max-w-xl text-sm text-brand-100">{t.lead}</p>
          </div>
          <Link href={homeHref} className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50">
            {homeLabel}
          </Link>
        </div>
      </section>
    </>
  );
}
