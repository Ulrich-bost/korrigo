"use client";

import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/components/I18nProvider";

export function AuthShell({ children }: { children: ReactNode }) {
  const { dict } = useI18n();
  const home = dict.home;

  return (
    <div className="grid min-h-[calc(100vh-8rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
      <aside className="relative hidden overflow-hidden border-e border-brand-900 bg-brand-800 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-ai-500" />
        <div className="absolute -right-16 top-24 h-56 w-56 rounded-full bg-brand-600/40" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-ai-500/20" />
        <div className="relative px-12 pb-10 pt-16">
          <Logo tone="onDark" className="text-2xl" />
          <h2 className="mt-10 max-w-md text-4xl font-bold leading-tight tracking-tight">
            {home.title1}
            <span className="mt-1 block text-brand-100">{home.title2}</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-brand-100">{home.lead}</p>
        </div>
        <ol className="relative space-y-5 px-12 pb-14">
          {home.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-800">
                {index + 1}
              </span>
              <span>
                <span className="block font-semibold">{step.title}</span>
                <span className="mt-0.5 block text-sm text-brand-100">{step.desc}</span>
              </span>
            </li>
          ))}
        </ol>
      </aside>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
