import { headers } from "next/headers";

function isLocalHost(host: string) {
  const name = host.split(":")[0].replace(/^\[|\]$/g, "");
  return name === "localhost" || name === "127.0.0.1" || name === "::1";
}

/** Origine publique de la requête, pour que le lien d'e-mail n'aille pas vers localhost. */
export function publicAppOrigin() {
  const headerHost = headers().get("x-forwarded-host") ?? headers().get("host") ?? "";
  const host = headerHost.split(",")[0].trim().toLowerCase();
  if (host && !isLocalHost(host) && /^[a-z0-9.-]+(?::\d+)?$/.test(host)) {
    return `https://${host}`;
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured && !isLocalHost(configured.replace(/^https?:\/\//, ""))) {
    return configured;
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, "");
  if (productionHost) return `https://${productionHost}`;

  return configured || "http://localhost:3000";
}

export function confirmationRedirect(nextPath: string) {
  const next = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/espace";
  return `${publicAppOrigin()}/auth/callback?next=${encodeURIComponent(next)}`;
}
