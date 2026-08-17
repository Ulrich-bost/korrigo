import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export const PLANS = {
  monthly: {
    id: "monthly" as const,
    name: "Mensuel",
    price: 9.99,
    interval: "mois" as const,
    priceId: () => process.env.STRIPE_PRICE_MONTHLY!,
    features: [
      "Accès illimité aux sujets corrigés",
      "Téléchargement PDF",
      "Nouveaux sujets chaque semaine",
      "Filtres avancés par université",
    ],
  },
  yearly: {
    id: "yearly" as const,
    name: "Annuel",
    price: 79.99,
    interval: "an" as const,
    priceId: () => process.env.STRIPE_PRICE_YEARLY!,
    savings: "33%",
    features: [
      "Tout le plan mensuel",
      "2 mois offerts",
      "Support prioritaire",
      "Accès anticipé aux nouveautés",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
