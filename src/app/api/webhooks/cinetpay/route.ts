import { NextRequest, NextResponse } from "next/server";
import { fulfillCinetpayPayment } from "@/lib/fulfill-payment";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  let transactionId: string | null = null;

  try {
    if (raw.trim().startsWith("{")) {
      const body = JSON.parse(raw) as { cpm_trans_id?: string; transaction_id?: string };
      transactionId = body.cpm_trans_id ?? body.transaction_id ?? null;
    } else {
      const params = new URLSearchParams(raw);
      transactionId = params.get("cpm_trans_id") ?? params.get("transaction_id");
    }
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!transactionId) {
    return NextResponse.json({ received: true, ignored: true });
  }

  await fulfillCinetpayPayment({ transactionId });
  return NextResponse.json({ received: true });
}
