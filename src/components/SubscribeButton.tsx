"use client";

import { useTransition } from "react";
import { createCheckoutSession } from "@/app/actions/subscription";
import type { PayRail } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/I18nProvider";
import type { Dict } from "@/i18n/messages";

interface SubscribeButtonProps {
  rail: PayRail;
  loggedIn: boolean;
  examId?: string;
  className?: string;
}

export function SubscribeButton({ rail, loggedIn, examId, className }: SubscribeButtonProps) {
  const { dict } = useI18n();
  const [pending, startTransition] = useTransition();
  const label = rail === "ccp" ? dict.pay.ccp : dict.pay.card;

  function errorText(code: string) {
    return code in dict.errors ? dict.errors[code as keyof Dict["errors"]] : dict.errors.payment;
  }

  return (
    <button
      type="button"
      disabled={pending}
      aria-busy={pending}
      className={cn(className, pending && "cursor-wait opacity-60")}
      onClick={() =>
        startTransition(async () => {
          if (!loggedIn) {
            window.location.href = "/connexion?redirect=/tarifs";
            return;
          }
          const result = await createCheckoutSession(rail, examId);
          if (result?.error) alert(errorText(result.error));
        })
      }
    >
      {pending ? dict.pay.pending : label}
    </button>
  );
}
