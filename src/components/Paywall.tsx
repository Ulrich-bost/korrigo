import { SubscribeButton } from "@/components/SubscribeButton";
import { OFFER, formatDzd, formatFcfa } from "@/lib/plans";

export function Paywall({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold">Bénéficiez de tous les sujets</h2>
      <p className="mt-2 text-slate-600">
        Un paiement unique de {formatDzd(OFFER.price)} donne accès à tous les
        sujets et corrigés, dans toutes les facultés, filières et niveaux.
      </p>
      {loggedIn ? (
        <div className="mt-6 flex flex-col items-center gap-3">
          <SubscribeButton rail="ccp" loggedIn className="btn-primary" />
          <SubscribeButton rail="card" loggedIn className="btn-secondary" />
          <p className="text-xs text-slate-500">
            CCP (Algérie, {formatDzd(OFFER.price)}) ou carte Visa/Mastercard d&apos;une banque
            d&apos;Afrique subsaharienne ({formatFcfa(OFFER.cardAmount)}).
          </p>
        </div>
      ) : null}
    </div>
  );
}
