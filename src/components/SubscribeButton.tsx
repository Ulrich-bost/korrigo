"use client";

import { useTransition } from "react";
import { createCheckoutSession } from "@/app/actions/subscription";
import type { PayRail } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface SubscribeButtonProps {
  rail: PayRail;
  loggedIn: boolean;
  className?: string;
}

const LABELS: Record<PayRail, string> = {
  ccp: "Payer par CCP",
  card: "Payer par carte bancaire",
};

export function SubscribeButton({ rail, loggedIn, className }: SubscribeButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={cn(className, pending && "opacity-60")}
      onClick={() =>
        startTransition(async () => {
          if (!loggedIn) {
            window.location.href = "/connexion?redirect=/tarifs";
            return;
          }
          const result = await createCheckoutSession(rail);
          if (result?.error) alert(result.error);
        })
      }
    >
      {pending ? "Redirection vers le paiement..." : LABELS[rail]}
    </button>
  );
}
