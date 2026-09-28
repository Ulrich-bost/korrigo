"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "@/app/actions/locale";
import { LOCALES, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";

const SHORT: Record<Locale, string> = { fr: "FR", en: "EN", ar: "ع" };

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1" role="group" aria-label={dictionaries[locale].nav.language}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          disabled={pending || code === locale}
          onClick={() =>
            startTransition(async () => {
              await setLocaleAction(code);
              router.refresh();
            })
          }
          className={`rounded-md px-2 py-1 text-xs font-semibold ${
            code === locale ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
          lang={code}
        >
          {SHORT[code]}
        </button>
      ))}
    </div>
  );
}
