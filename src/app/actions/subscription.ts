"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

export async function createCheckoutSession(rail: PayRail) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect=/tarifs");

  if (rail === "ccp" && !isChargilyConfigured()) {
    return { error: "ccp_unconfigured" };
  }
  if (rail === "card" && !isCinetpayConfigured()) {
    return { error: "card_unconfigured" };
  }

  const isCard = rail === "card";
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      plan: "YEARLY",
      amount: isCard ? OFFER.cardAmount : OFFER.price,
      currency: isCard ? OFFER.cardCurrency : OFFER.currency,
      status: "PENDING",
      operator: isCard ? "card" : "edahabia",
    },
  });

  try {
    if (isCard) {
      const transactionId = `${Date.now()}${payment.id.replace(/\W/g, "").slice(-6)}`;
      const card = await createCardPayment({
        transactionId,
        amount: OFFER.cardAmount,
        paymentId: payment.id,
        description: "KORRIGO acces complet",
        name: user.name,
        email: user.email,
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { checkoutId: transactionId },
      });
      redirect(card.url);
    }

    const checkout = await createCheckout({
      amount: OFFER.price,
      method: "edahabia",
      paymentId: payment.id,
      description: "KORRIGO — accès complet, paiement unique",
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutId: checkout.id },
    });
    redirect(checkout.url);
  } catch (error) {
    if (isRedirect(error)) throw error;
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return {
      error: "payment",
    };
  }
}

export async function syncLatestPayment() {
  const user = await getCurrentUser();
  if (!user) return { ok: false };

  const pending = await prisma.payment.findFirst({
    where: { userId: user.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  if (!pending?.checkoutId) return { ok: true };

  if (pending.operator === "card") {
    await fulfillCinetpayPayment({ paymentId: pending.id, transactionId: pending.checkoutId });
  } else {
    await fulfillChargilyPayment({ paymentId: pending.id, checkoutId: pending.checkoutId });
  }
  return { ok: true };
}
