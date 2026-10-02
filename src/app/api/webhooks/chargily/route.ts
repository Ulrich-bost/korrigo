import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/chargily";
import { fulfillChargilyPayment } from "@/lib/fulfill-payment";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 403 });
  }

  let event: {
    type?: string;
    data?: {
      id?: string;
      metadata?: { payment_id?: string } | null;
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const checkoutId = event.data?.id;
  const paymentId = event.data?.metadata?.payment_id;
  if (!checkoutId && !paymentId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  await fulfillChargilyPayment({
    paymentId,
    checkoutId,
  });

  return NextResponse.json({ received: true });
}
