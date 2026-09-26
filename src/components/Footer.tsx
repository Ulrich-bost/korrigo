import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo height={30} />
            <p className="mt-3 max-w-md text-sm text-slate-600">
              L&apos;IA au service de ta réussite. Sujets d&apos;examen corrigés classés par
              faculté, filière et niveau.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Navigation</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/sujets" className="hover:text-brand-600">Catalogue</Link></li>
              <li><Link href="/inscription" className="hover:text-brand-600">Créer un compte</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Légal</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/mentions-legales" className="hover:text-brand-600">Mentions légales</Link></li>
              <li><Link href="/cgv" className="hover:text-brand-600">CGV</Link></li>
              <li><Link href="/confidentialite" className="hover:text-brand-600">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} KORRIGO — KNJSoft. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
