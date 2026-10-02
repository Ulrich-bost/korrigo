import Link from "next/link";
import { CircleUser, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { SessionUser } from "@/lib/auth";
import type { Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";

interface NavbarProps {
  session: SessionUser | null;
  locale: Locale;
}

export function Navbar({ session, locale }: NavbarProps) {
  const t = dictionaries[locale].nav;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href={session?.role === "student" ? "/espace" : "/"} className="inline-flex items-center">
          <Logo />
        </Link>


        <div className="hidden items-center gap-6 md:flex">
          {session?.role === "student" ? (
            <Link href="/espace" className="text-sm font-medium text-slate-600 hover:text-brand-700">
              {t.exams}
            </Link>
          ) : (
            <Link href="/sujets" className="text-sm font-medium text-slate-600 hover:text-brand-700">
              {t.catalog}
            </Link>
          )}
          <LanguageSwitcher locale={locale} />
          {session ? (
            <>
              <Link
                href="/compte"
                aria-label={session.name ? `${t.account}, ${session.name}` : t.account}
                title={session.name || t.account}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-700"
              >
                <CircleUser className="h-5 w-5 text-brand-800" aria-hidden />
                {t.account}
              </Link>
              {(session.role === "admin" || session.role === "super_admin") && (
                <Link href="/admin" className="text-sm font-medium text-ai-600 hover:text-ai-700">
                  {t.admin}
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                {t.login}
              </Link>
              <Link href="/inscription" className="btn-primary">
                {t.signup}
              </Link>
            </>
          )}
        </div>

        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg p-2 hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
            <Menu className="h-6 w-6 open:hidden" />
            <X className="hidden h-6 w-6 open:block" />
          </summary>
          <div className="absolute end-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <nav className="flex flex-col gap-3">
              <LanguageSwitcher locale={locale} />
              <Link href={session?.role === "student" ? "/espace" : "/sujets"}>
                {session?.role === "student" ? t.exams : t.catalog}
              </Link>
              {session ? (
                <Link
                  href="/compte"
                  aria-label={session.name ? `${t.account}, ${session.name}` : t.account}
                  title={session.name || t.account}
                  className="inline-flex items-center gap-2"
                >
                  <CircleUser className="h-5 w-5 text-brand-800" aria-hidden />
                  {t.account}
                </Link>
              ) : (
                <>
                  <Link href="/connexion">{t.login}</Link>
                  <Link href="/inscription" className="btn-primary text-center">
                    {t.signup}
                  </Link>
                </>
              )}
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
