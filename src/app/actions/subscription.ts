"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getStripe, PLANS, type PlanId } from "@/lib/stripe";

export async function createCheckoutSession(planId: PlanId) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect=/tarifs");

  const plan = PLANS[planId];
  const priceId = plan.priceId();

  if (!priceId || priceId.startsWith("price_...")) {
    return {
      error:
        "Stripe n'est pas configuré. Ajoutez vos clés API dans le fichier .env",
    };
  }

  const stripe = getStripe();
  let customerId = user.subscription?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await import("@/lib/prisma").then(({ prisma }) =>
      prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          plan: planId === "monthly" ? "MONTHLY" : "YEARLY",
          status: "EXPIRED",
          stripeCustomerId: customerId,
        },
        update: { stripeCustomerId: customerId },
      })
    );
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/compte?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tarifs?canceled=1`,
    metadata: { userId: user.id, plan: planId },
  });

  if (!session.url) {
    return { error: "Impossible de créer la session de paiement" };
  }

  redirect(session.url);
}

export async function createPortalSession() {
  const user = await getCurrentUser();
  if (!user?.subscription?.stripeCustomerId) {
    return { error: "Aucun abonnement Stripe associé" };
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/compte`,
  });

  redirect(session.url);
}
