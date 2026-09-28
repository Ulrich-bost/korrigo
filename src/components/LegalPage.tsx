import { getI18n } from "@/i18n/get-i18n";

export default function LegalPage({ kind }: { kind: "mentions" | "terms" | "privacy" }) {
  const { dict } = getI18n();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{dict.legal[kind]}</h1>
      <div className="prose prose-slate mt-8 max-w-none text-slate-600">
        <p>{dict.legal.placeholder}</p>
      </div>
    </div>
  );
}
