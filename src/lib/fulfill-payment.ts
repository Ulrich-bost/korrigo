import { prisma } from "@/lib/prisma";
import { retrieveCheckout } from "@/lib/chargily";
import { checkCardPayment } from "@/lib/cinetpay";

async function grantAccess(paymentId: string, userId: string, plan: "MONTHLY" | "YEARLY", provider: string, reference: string, operator: string | null) {
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "SUCCESSFUL", operator, checkoutId: reference },
    }),
    prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        status: "ACTIVE",
        provider,
        providerReference: reference,
        currentPeriodEnd: null,
      },
      update: {
        plan,
        status: "ACTIVE",
        provider,
        providerReference: reference,
        currentPeriodEnd: null,
      },
    }),
  ]);

  return prisma.payment.findUnique({ where: { id: paymentId } });
}

export async function fulfillChargilyPayment(opts: {
  paymentId?: string;
  checkoutId?: string;
}) {
  const payment = opts.paymentId
    ? await prisma.payment.findUnique({ where: { id: opts.paymentId } })
    : opts.checkoutId
      ? await prisma.payment.findUnique({ where: { checkoutId: opts.checkoutId } })
      : null;

  if (!payment || payment.status === "SUCCESSFUL") return payment;
  if (payment.operator === "card") return payment;

  const checkoutId = opts.checkoutId ?? payment.checkoutId;
  if (!checkoutId) return payment;

  const checkout = await retrieveCheckout(checkoutId);
  const status = (checkout.status ?? "").toLowerCase();
  const method = checkout.payment_method ?? payment.operator;

  if (method === "cib") {
    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", operator: method, checkoutId },
    });
  }

  if (status === "failed" || status === "canceled" || status === "expired") {
    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", operator: method, checkoutId },
    });
  }

  if (status !== "paid") return payment;

  const metadataId = checkout.metadata?.payment_id;
  if (metadataId && metadataId !== payment.id) return payment;
  if (checkout.amount != null && Number(checkout.amount) !== payment.amount) {
    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", operator: method, checkoutId },
    });
  }

  return grantAccess(payment.id, payment.userId, payment.plan, "chargily", checkoutId, method);
}

export async function fulfillCinetpayPayment(opts: { paymentId?: string; transactionId?: string }) {
  const payment = opts.paymentId
    ? await prisma.payment.findUnique({ where: { id: opts.paymentId } })
    : opts.transactionId
      ? await prisma.payment.findUnique({ where: { checkoutId: opts.transactionId } })
      : null;

  if (!payment || payment.status === "SUCCESSFUL") return payment;

  const transactionId = opts.transactionId ?? payment.checkoutId;
  if (!transactionId) return payment;

  const tx = await checkCardPayment(transactionId);
  if (!tx) return payment;

  const status = (tx.status ?? "").toUpperCase();
  const method = tx.payment_method ?? "card";

  if (status === "REFUSED") {
    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", operator: method, checkoutId: transactionId },
    });
  }

  if (status !== "ACCEPTED") return payment;

  if (tx.metadata && tx.metadata !== payment.id) return payment;
  if (tx.amount != null && Number(tx.amount) !== payment.amount) {
    return prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", operator: method, checkoutId: transactionId },
    });
  }

  return grantAccess(payment.id, payment.userId, payment.plan, "cinetpay", transactionId, method);
}
