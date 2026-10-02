"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCheckout, isChargilyConfigured } from "@/lib/chargily";
import { createCardPayment, isCinetpayConfigured } from "@/lib/cinetpay";
import { fulfillChargilyPayment, fulfillCinetpayPayment } from "@/lib/fulfill-payment";
import { OFFER, type PayRail } from "@/lib/plans";

function isRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function createCheckoutSession(rail: PayRail, examId?: string) {
  const user = await getCurrentUser();
  if (!user) redirect(examId ? `/connexion?redirect=/sujets` : "/connexion?redirect=/tarifs");

  if (rail === "ccp" && !isChargilyConfigured()) return { error: "ccp_unconfigured" };
  if (rail === "card" && !isCinetpayConfigured()) return { error: "card_unconfigured" };
  if (!examId && !user.programId) return { error: "program_required" };

  const isCard = rail === "card";
  const supabase = createSupabaseServerClient();
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      profile_id: user.id,
      kind: examId ? "one_time" : "subscription",
      plan: examId ? null : "yearly",
      program_id: examId ? null : user.programId,
      exam_id: examId ?? null,
      amount: isCard ? OFFER.cardAmount : OFFER.price,
      currency: isCard ? OFFER.cardCurrency : OFFER.currency,
      status: "pending",
      operator: isCard ? "card" : "edahabia",
    })
    .select("id")
    .single();
  if (error || !payment) return { error: "payment" };

  try {
    if (isCard) {
      const transactionId = `${Date.now()}${payment.id.replace(/\W/g, "").slice(-6)}`;
      const card = await createCardPayment({
        transactionId,
        amount: OFFER.cardAmount,
        paymentId: payment.id,
        description: examId ? "KORRIGO sujet" : "KORRIGO abonnement filiere",
        name: user.name,
        email: user.email,
      });
      const { error: attachError } = await supabase.rpc("attach_checkout", {
        p_payment_id: payment.id,
        p_checkout_id: transactionId,
      });
      if (attachError) return { error: "payment" };
      redirect(card.url);
    }

    const checkout = await createCheckout({
      amount: OFFER.price,
      method: "edahabia",
      paymentId: payment.id,
      description: examId ? "KORRIGO — achat d'un sujet" : "KORRIGO — abonnement annuel à la filière",
    });
    const { error: attachError } = await supabase.rpc("attach_checkout", {
      p_payment_id: payment.id,
      p_checkout_id: checkout.id,
    });
    if (attachError) return { error: "payment" };
    redirect(checkout.url);
  } catch (error) {
    if (isRedirect(error)) throw error;
    await supabase.rpc("fulfill_payment", {
      p_secret: process.env.FULFILLMENT_SECRET,
      p_payment_id: payment.id,
      p_status: "failed",
      p_provider: isCard ? "cinetpay" : "chargily",
    });
    return { error: "payment" };
  }
}

export async function syncLatestPayment() {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  const supabase = createSupabaseServerClient();
  const { data: pending } = await supabase
    .from("payments")
    .select("id, checkout_id, operator")
    .eq("profile_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!pending?.checkout_id) return { ok: true };
  if (pending.operator === "card") {
    await fulfillCinetpayPayment({ paymentId: pending.id, transactionId: pending.checkout_id });
  } else {
    await fulfillChargilyPayment({ paymentId: pending.id, checkoutId: pending.checkout_id });
  }
  return { ok: true };
}
