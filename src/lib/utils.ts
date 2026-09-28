export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(date: Date | string | null | undefined, locale: "fr" | "en" | "ar" = "fr"): string {
  if (!date) return "—";
  const intl = locale === "ar" ? "ar-DZ" : locale === "en" ? "en-GB" : "fr-DZ";
  return new Intl.DateTimeFormat(intl, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
