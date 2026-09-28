import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/messages";

export function getLocale(): Locale {
  const value = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : "fr";
}

export function getI18n() {
  const locale = getLocale();
  return { locale, dict: dictionaries[locale] };
}
