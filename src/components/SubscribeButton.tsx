"use client";

import { useTransition } from "react";
import { createCheckoutSession } from "@/app/actions/subscription";
import type { PlanId } from "@/lib/stripe";
import { cn } from "@/lib/utils";

interface SubscribeButtonProps {
  planId: PlanId;
  loggedIn: boolean;
  className?: string;
}

export function SubscribeButton({ planId, loggedIn, className }: SubscribeButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={cn(className, pending && "opacity-60")}
      onClick={() =>
        startTransition(async () => {
          if (!loggedIn) {
            window.location.href = `/connexion?redirect=/tarifs`;
            return;
          }
          const result = await createCheckoutSession(planId);
          if (result?.error) alert(result.error);
        })
      }
    >
      {pending ? "Redirection..." : "S'abonner"}
    </button>
  );
}
