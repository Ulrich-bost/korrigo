export const LOCALES = ["fr", "en", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "korrigo_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en" || value === "ar";
}
