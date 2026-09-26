const CHECKOUT_URL = "https://api-checkout.cinetpay.com/v2/payment";
const CHECK_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

export type CinetpayStatus = {
  status?: string;
  amount?: string | number;
  currency?: string;
  payment_method?: string;
  metadata?: string | null;
};

function credentials() {
  const apiKey = process.env.CINETPAY_API_KEY?.trim();
  const siteId = process.env.CINETPAY_SITE_ID?.trim();
  if (!apiKey || !siteId) return null;
  return { apiKey, siteId };
}

export function isCinetpayConfigured() {
  return credentials() !== null;
}

function currency() {
  return (process.env.CINETPAY_CURRENCY ?? "XAF").toUpperCase();
}

export async function createCardPayment(input: {
  transactionId: string;
  amount: number;
  paymentId: string;
  description: string;
  name: string;
  email: string;
}) {
  const creds = credentials();
  if (!creds) {
    throw new Error("CinetPay n'est pas configuré (CINETPAY_API_KEY / CINETPAY_SITE_ID)");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [firstName, ...rest] = input.name.split(" ");
  const surname = rest.join(" ") || firstName || "Etudiant";

  const res = await fetch(CHECKOUT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      apikey: creds.apiKey,
      site_id: creds.siteId,
      transaction_id: input.transactionId,
      amount: input.amount,
      currency: currency(),
      description: input.description,
      notify_url: `${appUrl}/api/webhooks/cinetpay`,
      return_url: `${appUrl}/compte?success=1`,
      channels: "CREDIT_CARD",
      metadata: input.paymentId,
      customer_name: firstName || input.name,
      customer_surname: surname,
      customer_email: input.email,
      customer_phone_number: "+237600000000",
      customer_address: "Paiement en ligne",
      customer_city: "Douala",
      customer_country: "CM",
      customer_state: "LT",
      customer_zip_code: "00237",
    }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as {
    code?: string;
    message?: string;
    description?: string;
    data?: { payment_url?: string };
  };

  if (data.code !== "201" || !data.data?.payment_url) {
    throw new Error(data.description || data.message || "Impossible de créer le paiement par carte");
  }

  return { url: data.data.payment_url };
}

export async function checkCardPayment(transactionId: string): Promise<CinetpayStatus | null> {
  const creds = credentials();
  if (!creds) return null;

  const res = await fetch(CHECK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      apikey: creds.apiKey,
      site_id: creds.siteId,
      transaction_id: transactionId,
    }),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => ({}))) as {
    code?: string;
    data?: CinetpayStatus;
  };

  if (data.code !== "00" || !data.data) return null;
  return data.data;
}
