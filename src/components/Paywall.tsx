import { SubscribeButton } from "@/components/SubscribeButton";
import { OFFER, formatDzd, formatFcfa } from "@/lib/plans";
import { getI18n } from "@/i18n/get-i18n";

export function Paywall({ loggedIn }: { loggedIn: boolean }) {
  const { dict } = getI18n();
  const t = dict.paywall;

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold">{t.title}</h2>
      <p className="mt-2 text-slate-600">{t.lead(formatDzd(OFFER.price))}</p>
      {loggedIn ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          <SubscribeButton rail="ccp" loggedIn className="btn-primary" />
          <SubscribeButton rail="card" loggedIn className="btn-secondary" />
          <p className="text-xs text-slate-500">
            {t.note(formatDzd(OFFER.price), formatFcfa(OFFER.cardAmount))}
          </p>
        </div>
      ) : null}
    </div>
  );
}
