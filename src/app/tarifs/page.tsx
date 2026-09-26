import Link from "next/link";
import { Check } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { OFFER, formatDzd, formatFcfa } from "@/lib/plans";
import { SubscribeButton } from "@/components/SubscribeButton";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: { canceled?: string };
}) {
  const user = await getCurrentUser();
  const hasSub =
    user?.subscription?.status === "ACTIVE" &&
    (!user.subscription.currentPeriodEnd ||
      user.subscription.currentPeriodEnd > new Date());

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Voir plus de sujets</h1>
        <p className="mt-4 text-lg text-slate-600">
          Un paiement unique de {formatDzd(OFFER.price)} donne accès à tous les sujets
          et corrigés. CCP pour l&apos;Algérie, ou carte d&apos;une banque d&apos;Afrique subsaharienne.
        </p>
      </div>

      {searchParams.canceled && (
        <div className="mx-auto mt-8 max-w-2xl rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          Paiement annulé. Vous pouvez réessayer quand vous voulez.
        </div>
      )}
      {hasSub && (
        <div className="mx-auto mt-8 max-w-2xl rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-800">
          Vous avez déjà accès à tout le catalogue. Consultez{" "}
          <Link href="/compte" className="font-semibold underline">
            votre compte
          </Link>
          .
        </div>
      )}

      <div className="mx-auto mt-14 max-w-md">
        <div className="card relative border-brand-500 ring-2 ring-brand-500">
          <h2 className="text-xl font-bold">{OFFER.name}</h2>
          <p className="mt-1 text-sm text-slate-500">Paiement unique</p>
          <p className="mt-4">
            <span className="text-5xl font-bold">{formatDzd(OFFER.price)}</span>
          </p>
          <ul className="mt-8 space-y-3">
            {OFFER.features.map((f) => (
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
                CCP via EDAHABIA, Algérie Poste ({formatDzd(OFFER.price)}). Carte Visa ou
                Mastercard d&apos;une banque d&apos;Afrique subsaharienne ({formatFcfa(OFFER.cardAmount)}),
                hors Algérie.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-center text-xl font-bold">Questions fréquentes</h2>
        <dl className="mt-8 space-y-6">
          {[
            {
              q: "Quels moyens de paiement acceptez-vous ?",
              a: "CCP (EDAHABIA, Algérie Poste) pour l'Algérie, à 500 DA. Carte Visa ou Mastercard émise par une banque d'Afrique subsaharienne, en francs CFA. Les cartes des banques algériennes ne passent pas par ce bouton.",
            },
            {
              q: "Les sujets sont-ils mis à jour ?",
              a: "Nous ajoutons de nouveaux sujets corrigés chaque semaine, classés par faculté, filière et niveau.",
            },
            {
              q: "Puis-je télécharger les PDF ?",
              a: "Oui, après le paiement unique vous pouvez télécharger les sujets au format PDF pour réviser hors ligne.",
            },
          ].map(({ q, a }) => (
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
