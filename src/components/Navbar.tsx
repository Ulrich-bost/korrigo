import Link from "next/link";
import { Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b-2 border-brand-700 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo height={34} priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/sujets" className="text-sm font-medium text-slate-600 hover:text-brand-600">
            {t.catalog}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher locale={locale} />
          {session ? (
            <>
              <Link href="/compte" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                {session.name}
              </Link>
              {session.role === "ADMIN" && (
                <Link href="/admin" className="text-sm font-medium text-amber-600 hover:text-amber-700">
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
              <Link href="/sujets">{t.catalog}</Link>
              {session ? (
                <Link href="/compte">{t.account}</Link>
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
