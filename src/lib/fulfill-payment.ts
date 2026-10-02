import { retrieveCheckout } from "@/lib/chargily";
import { checkCardPayment } from "@/lib/cinetpay";
import { createSupabasePublicClient } from "@/lib/supabase/server";

interface PaymentRow {
  id: string;
  profile_id: string;
  kind: "subscription" | "one_time";
  plan: "monthly" | "yearly" | null;
  program_id: string | null;
  exam_id: string | null;
  amount: number;
  currency: string;
  status: "pending" | "successful" | "failed";
  checkout_id: string | null;
  operator: string | null;
}

function secret() {
  const value = process.env.FULFILLMENT_SECRET;
  if (!value) throw new Error("FULFILLMENT_SECRET is not set");
  return value;
}

async function readPayment(opts: { paymentId?: string; checkoutId?: string }) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc("read_payment_for_webhook", {
    p_secret: secret(),
    p_payment_id: opts.paymentId ?? null,
    p_checkout_id: opts.checkoutId ?? null,
  });
  if (error) throw error;
  return (data as PaymentRow | null) ?? null;
}

async function settle(
  paymentId: string,
  status: "successful" | "failed",
  checkoutId: string | null,
  operator: string | null,
  provider: string
) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc("fulfill_payment", {
    p_secret: secret(),
    p_payment_id: paymentId,
    p_status: status,
    p_checkout_id: checkoutId,
    p_operator: operator,
    p_provider: provider,
  });
  if (error) throw error;
  return (data as PaymentRow | null) ?? null;
}

export async function fulfillChargilyPayment(opts: { paymentId?: string; checkoutId?: string }) {
  const payment = await readPayment(opts);
  if (!payment || payment.status === "successful") return payment;
  if (payment.operator === "card") return payment;

  const checkoutId = opts.checkoutId ?? payment.checkout_id;
  if (!checkoutId) return payment;

  const checkout = await retrieveCheckout(checkoutId);
  const status = (checkout.status ?? "").toLowerCase();
  const method = checkout.payment_method ?? payment.operator;

  if (method === "cib" || status === "failed" || status === "canceled" || status === "expired") {
    return settle(payment.id, "failed", checkoutId, method, "chargily");
  }
  if (status !== "paid") return payment;

  const metadataId = checkout.metadata?.payment_id;
  if (metadataId && metadataId !== payment.id) return payment;
  if (checkout.amount != null && Number(checkout.amount) !== payment.amount) {
    return settle(payment.id, "failed", checkoutId, method, "chargily");
  }

  return settle(payment.id, "successful", checkoutId, method, "chargily");
}

export async function fulfillCinetpayPayment(opts: { paymentId?: string; transactionId?: string }) {
  const payment = await readPayment({
    paymentId: opts.paymentId,
    checkoutId: opts.transactionId,
  });
  if (!payment || payment.status === "successful") return payment;

  const transactionId = opts.transactionId ?? payment.checkout_id;
  if (!transactionId) return payment;

  const tx = await checkCardPayment(transactionId);
  if (!tx) return payment;

  const status = (tx.status ?? "").toUpperCase();
  const method = tx.payment_method ?? "card";

  if (status === "REFUSED") {
    return settle(payment.id, "failed", transactionId, method, "cinetpay");
  }
  if (status !== "ACCEPTED") return payment;
  if (tx.metadata && tx.metadata !== payment.id) return payment;
  if (tx.amount != null && Number(tx.amount) !== payment.amount) {
    return settle(payment.id, "failed", transactionId, method, "cinetpay");
  }

  return settle(payment.id, "successful", transactionId, method, "cinetpay");
}
