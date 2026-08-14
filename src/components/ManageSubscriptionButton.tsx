"use client";

import { useTransition } from "react";
import { createPortalSession } from "@/app/actions/subscription";

export function ManageSubscriptionButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="btn-secondary mt-4"
      onClick={() =>
        startTransition(async () => {
          const result = await createPortalSession();
          if (result?.error) alert(result.error);
        })
      }
    >
      {pending ? "Chargement..." : "Gérer mon abonnement"}
    </button>
  );
}
