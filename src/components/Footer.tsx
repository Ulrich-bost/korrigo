import Link from "next/link";
import { Logo } from "@/components/Logo";
import type { Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";

export function Footer({ locale }: { locale: Locale }) {
  const t = dictionaries[locale].footer;

  return (
    <footer className="border-t border-brand-900 bg-brand-900 text-brand-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo tone="onDark" className="text-2xl" />
            <p className="mt-4 max-w-md text-sm leading-relaxed">{t.tagline}</p>
          </div>
          <div>
            <h3 className="font-semibold text-white">{t.navigation}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/sujets" className="hover:text-white">{t.catalog}</Link></li>
              <li><Link href="/inscription" className="hover:text-white">{t.signup}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white">{t.legal}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/mentions-legales" className="hover:text-white">{t.mentions}</Link></li>
              <li><Link href="/cgv" className="hover:text-white">{t.terms}</Link></li>
              <li><Link href="/confidentialite" className="hover:text-white">{t.privacy}</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-brand-200">
          © {new Date().getFullYear()} KORRIGO {t.rights}
        </p>
      </div>
    </footer>
  );
}
