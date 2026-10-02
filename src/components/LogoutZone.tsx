"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LogOut, X } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { useI18n } from "@/components/I18nProvider";

export function LogoutZone() {
  const { dict } = useI18n();
  const t = dict.account;
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const leadId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    dialog?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>("button, [href], input, select, textarea")].filter(
        (node) => !node.hasAttribute("disabled")
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <section className="mt-12 rounded-card border border-ai-200 bg-ai-50 p-6">
      <h2 className="text-lg font-semibold text-ai-800">{t.danger.zone}</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{t.danger.lead}</p>
      <button ref={triggerRef} type="button" className="btn-ai mt-5" onClick={() => setOpen(true)}>
        <LogOut className="h-4 w-4" aria-hidden />
        {t.logout}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-900/50 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={leadId}
            tabIndex={-1}
            className="w-full max-w-md rounded-card border border-ai-200 bg-white p-6 shadow-lg outline-none"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id={titleId} className="text-lg font-semibold text-brand-900">
                {t.danger.zone}
              </h3>
              <button
                type="button"
                onClick={close}
                aria-label={t.danger.cancel}
                className="rounded-lg p-1 text-slate-500 hover:bg-ai-50 hover:text-ai-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p id={leadId} className="mt-3 text-sm leading-relaxed text-slate-600">
              {t.danger.lead}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={close}>
                {t.danger.cancel}
              </button>
              <form action={logoutAction}>
                <SubmitButton variant="ai" pendingLabel={dict.auth.loading}>
                  {t.danger.confirm}
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
