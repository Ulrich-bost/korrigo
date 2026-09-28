"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/i18n/config";
import { dictionaries, type Dict } from "@/i18n/messages";

const LocaleContext = createContext<Locale>("fr");

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useI18n(): { locale: Locale; dict: Dict } {
  const locale = useContext(LocaleContext);
  return { locale, dict: dictionaries[locale] };
}
