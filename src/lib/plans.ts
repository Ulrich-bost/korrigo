export const OFFER = {
  id: "access" as const,
  name: "Accès complet",
  price: 500,
  currency: "DZD" as const,
  // CinetPay encaisse en francs CFA (minimum 100, multiple de 5).
  cardAmount: 1000,
  cardCurrency: "XAF" as const,
  features: [
    "Accès illimité aux sujets corrigés",
    "Téléchargement PDF",
    "Nouveaux sujets chaque semaine",
    "Un seul paiement, sans renouvellement",
  ],
} as const;

export type PayRail = "ccp" | "card";

export function formatDzd(amount: number) {
  return `${amount.toLocaleString("fr-DZ")} DA`;
}

export function formatFcfa(amount: number) {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}
