import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      if (!userId) break;

      const subscriptionId = session.subscription as string;
      const stripeSub = await getStripe().subscriptions.retrieve(subscriptionId);

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: plan === "yearly" ? "YEARLY" : "MONTHLY",
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
        update: {
          plan: plan === "yearly" ? "YEARLY" : "MONTHLY",
          status: "ACTIVE",
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const dbSub = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!dbSub) break;

      const statusMap: Record<string, "ACTIVE" | "CANCELED" | "PAST_DUE" | "EXPIRED"> = {
        active: "ACTIVE",
        canceled: "CANCELED",
        past_due: "PAST_DUE",
        unpaid: "PAST_DUE",
        incomplete: "EXPIRED",
        incomplete_expired: "EXPIRED",
      };

      await prisma.subscription.update({
        where: { id: dbSub.id },
        data: {
          status: statusMap[sub.status] ?? "EXPIRED",
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
