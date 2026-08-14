import Link from "next/link";
import { Check } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PLANS } from "@/lib/stripe";
import { SubscribeButton } from "@/components/SubscribeButton";

export default async function PricingPage() {
  const user = await getCurrentUser();
  const hasSub =
    user?.subscription?.status === "ACTIVE" &&
    (!user.subscription.currentPeriodEnd ||
      user.subscription.currentPeriodEnd > new Date());

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Tarifs</h1>
        <p className="mt-4 text-lg text-slate-600">
          Accédez à tous les sujets corrigés. Sans engagement.
        </p>
      </div>

      {hasSub && (
        <div className="mx-auto mt-8 max-w-2xl rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-800">
          Vous avez déjà un abonnement actif. Gérez-le depuis{" "}
          <Link href="/compte" className="font-semibold underline">
            votre compte
          </Link>
          .
        </div>
      )}

      <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:mx-auto lg:max-w-4xl">
        {(Object.entries(PLANS) as [keyof typeof PLANS, typeof PLANS.monthly][]).map(
          ([key, plan]) => (
            <div
              key={key}
              className={`card relative ${key === "yearly" ? "border-brand-500 ring-2 ring-brand-500" : ""}`}
            >
              {"savings" in plan && plan.savings && (
                <span className="absolute -top-3 right-4 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  Économisez {plan.savings}
                </span>
              )}
              <h2 className="text-xl font-bold">{plan.name}</h2>
              <p className="mt-4">
                <span className="text-5xl font-bold">{plan.price.toFixed(2).replace(".", ",")} €</span>
                <span className="text-slate-500">/{plan.interval}</span>
              </p>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {f}
                  </li>
                ))}
              </ul>
              {!hasSub && (
                <SubscribeButton planId={key} loggedIn={!!user} className="btn-primary mt-8 w-full" />
              )}
            </div>
          )
        )}
      </div>

      <div className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-center text-xl font-bold">Questions fréquentes</h2>
        <dl className="mt-8 space-y-6">
          {[
            {
              q: "Puis-je annuler à tout moment ?",
              a: "Oui, vous pouvez résilier votre abonnement depuis votre espace client. L'accès reste actif jusqu'à la fin de la période payée.",
            },
            {
              q: "Les sujets sont-ils mis à jour ?",
              a: "Nous ajoutons de nouveaux sujets corrigés chaque semaine, couvrant les principales universités françaises.",
            },
            {
              q: "Puis-je télécharger les PDF ?",
              a: "Oui, tous les abonnés peuvent télécharger les sujets au format PDF pour réviser hors ligne.",
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
