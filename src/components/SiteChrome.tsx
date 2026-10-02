"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function SiteChrome({
  navbar,
  footer,
  children,
}: {
  navbar: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const dashboard = pathname.startsWith("/admin");

  return (
    <>
      {dashboard ? null : navbar}
      <main className={dashboard ? "min-h-screen bg-brand-50" : "min-h-[calc(100vh-8rem)]"}>{children}</main>
      {dashboard ? null : footer}
    </>
  );
}
