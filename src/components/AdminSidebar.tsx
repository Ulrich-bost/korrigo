"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CircleUser, LayoutDashboard, Users } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import type { AppRole } from "@/lib/auth";

export function AdminSidebar({
  role,
  name,
}: {
  role: Extract<AppRole, "admin" | "super_admin">;
  name: string;
}) {
  const pathname = usePathname();
  const { dict } = useI18n();
  const t = dict.admin;
  const items = [
    { href: "/admin", label: t.navOverview, icon: LayoutDashboard },
    { href: "/admin/sujets", label: t.navSubjects, icon: BookOpen },
    ...(role === "super_admin" ? [{ href: "/admin/comptes", label: t.navAccounts, icon: Users }] : []),
    { href: "/admin/profil", label: t.navProfile, icon: CircleUser },
  ];

  function active(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const Icon = item.icon;
        const on = active(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              on
                ? "flex items-center gap-3 rounded-xl bg-brand-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm"
                : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-100 hover:bg-white/10 hover:text-white"
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <aside className="bg-brand-900 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="text-lg font-bold tracking-tight text-white">
          KORRIGO
        </Link>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-100">
          {role === "super_admin" ? t.roleSuper : t.roleAdmin}
        </span>
      </div>
      <details className="border-t border-white/10 lg:hidden">
        <summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-white">{t.title}</summary>
        <div className="pb-3">{nav}</div>
      </details>
      <div className="hidden lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:pb-4">{nav}</div>
      <div className="hidden border-t border-white/10 px-4 py-4 lg:block">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-brand-200">{role === "super_admin" ? t.roleSuper : t.roleAdmin}</p>
      </div>
    </aside>
  );
}
