import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface NavbarProps {
  session: SessionUser | null;
}

export function Navbar({ session }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
          <GraduationCap className="h-8 w-8" />
          <span className="text-xl">UnivSujets</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/sujets" className="text-sm font-medium text-slate-600 hover:text-brand-600">
            Catalogue
          </Link>
          <Link href="/universites" className="text-sm font-medium text-slate-600 hover:text-brand-600">
            Universités
          </Link>
          <Link href="/tarifs" className="text-sm font-medium text-slate-600 hover:text-brand-600">
            Tarifs
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {session ? (
            <>
              <Link href="/compte" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                {session.name}
              </Link>
              {session.role === "ADMIN" && (
                <Link href="/admin" className="text-sm font-medium text-amber-600 hover:text-amber-700">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/connexion" className="text-sm font-medium text-slate-600 hover:text-brand-600">
                Connexion
              </Link>
              <Link href="/inscription" className="btn-primary">
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-lg p-2 hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
            <Menu className="h-6 w-6 open:hidden" />
            <X className="hidden h-6 w-6 open:block" />
          </summary>
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <nav className="flex flex-col gap-3">
              <Link href="/sujets">Catalogue</Link>
              <Link href="/universites">Universités</Link>
              <Link href="/tarifs">Tarifs</Link>
              {session ? (
                <Link href="/compte">Mon compte</Link>
              ) : (
                <>
                  <Link href="/connexion">Connexion</Link>
                  <Link href="/inscription" className="btn-primary text-center">
                    S&apos;inscrire
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
