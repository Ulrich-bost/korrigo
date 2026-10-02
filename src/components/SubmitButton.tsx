"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ai";

const variants: Record<Variant, string> = {
  primary: "btn-primary disabled:hover:bg-brand-700",
  secondary: "btn-secondary disabled:hover:bg-white",
  ai: "btn-ai disabled:hover:bg-ai-500",
};

interface SubmitButtonProps {
  children: ReactNode;
  pendingLabel: string;
  variant?: Variant;
  className?: string;
}

export function SubmitButton({ children, pendingLabel, variant = "primary", className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(variants[variant], "disabled:cursor-wait disabled:opacity-70", className)}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
