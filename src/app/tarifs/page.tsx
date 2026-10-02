import Link from "next/link";
import { Check } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { OFFER, formatDzd, formatFcfa } from "@/lib/plans";
import { SubscribeButton } from "@/components/SubscribeButton";
import { getI18n } from "@/i18n/get-i18n";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { canceled?: string };
}) {
  const { dict } = getI18n();
  const t = dict.pricing;
  const user = await getCurrentUser();
  const hasSub = !!user?.subscriptions.some(
    (sub) =>
      sub.status === "active" &&
      (!user.programId || sub.programId === user.programId) &&
      (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">{t.title}</h1>
        <p className="mt-4 text-lg text-slate-600">
          {t.lead(formatDzd(OFFER.price))}
        </p>
      </div>

      {searchParams.canceled && (
        <div className="mx-auto mt-8 max-w-2xl rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          {t.canceled}
        </div>
      )}
      {hasSub && (
        <div className="mx-auto mt-8 max-w-2xl rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-800">
          {t.already}{" "}
          <Link href="/compte" className="font-semibold underline">
            {t.account}
          </Link>
          .
        </div>
      )}

      <div className="mx-auto mt-14 max-w-md">
        <div className="card relative border-brand-500 ring-2 ring-brand-500">
          <h2 className="text-xl font-bold">{t.offerName}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.oneTime}</p>
          <p className="mt-4">
            <span className="text-5xl font-bold">{formatDzd(OFFER.price)}</span>
          </p>
          <ul className="mt-8 space-y-3">
            {t.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {f}
              </li>
            ))}
          </ul>
          {!hasSub && (
            <div className="mt-8 space-y-3">
              <SubscribeButton rail="ccp" loggedIn={!!user} className="btn-primary w-full" />
              <SubscribeButton rail="card" loggedIn={!!user} className="btn-secondary w-full" />
              <p className="text-center text-xs text-slate-500">
                {t.ccpNote(formatDzd(OFFER.price), formatFcfa(OFFER.cardAmount))}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-center text-xl font-bold">{t.faqTitle}</h2>
        <dl className="mt-8 space-y-6">
          {t.faq.map(({ q, a }) => (
            <div key={q} className="card">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-2 text-sm text-slate-600">{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
