import { createHmac, timingSafeEqual } from "crypto";

const TEST_BASE = "https://pay.chargily.net/test/api/v2";
const LIVE_BASE = "https://pay.chargily.net/api/v2";

export type ChargilyMethod = "edahabia";

export type ChargilyCheckout = {
  id?: string;
  status?: string;
  amount?: number;
  currency?: string;
  payment_method?: string | null;
  checkout_url?: string;
  metadata?: Record<string, string> | null;
  message?: string;
};

function secretKey() {
  const key = process.env.CHARGILY_SECRET_KEY?.trim();
  if (!key) return null;
  return key;
}

export function isChargilyConfigured() {
  return secretKey() !== null;
}

function baseUrl() {
  const mode = (process.env.CHARGILY_MODE ?? "test").toLowerCase();
  return mode === "live" ? LIVE_BASE : TEST_BASE;
}

async function chargilyFetch(path: string, init?: RequestInit) {
  const key = secretKey();
  if (!key) {
    throw new Error("Chargily n'est pas configuré (CHARGILY_SECRET_KEY)");
  }

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as ChargilyCheckout & {
    message?: string;
    errors?: Record<string, string[]>;
  };

  if (!res.ok) {
    const detail = data.message || Object.values(data.errors ?? {}).flat().join(" ");
    throw new Error(detail || "La demande de paiement Chargily a échoué");
  }

  return data;
}

export async function createCheckout(input: {
  amount: number;
  method: ChargilyMethod;
  paymentId: string;
  description: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkout = await chargilyFetch("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amount,
      currency: "dzd",
      payment_method: input.method,
      success_url: `${appUrl}/compte?success=1`,
      failure_url: `${appUrl}/tarifs?canceled=1`,
      webhook_endpoint: `${appUrl}/api/webhooks/chargily`,
      description: input.description,
      locale: "fr",
      metadata: { payment_id: input.paymentId },
    }),
  });

  if (!checkout.id || !checkout.checkout_url) {
    throw new Error("Réponse Chargily incomplète");
  }

  return { id: checkout.id, url: checkout.checkout_url };
}

export async function retrieveCheckout(checkoutId: string) {
  return chargilyFetch(`/checkouts/${checkoutId}`);
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const key = secretKey();
  if (!key || !signature) return false;

  const expected = createHmac("sha256", key).update(rawBody).digest("hex");
  const received = signature.trim().toLowerCase();
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
