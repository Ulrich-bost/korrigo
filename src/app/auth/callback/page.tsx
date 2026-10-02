"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/espace";
  return value;
}

function ConfirmSession() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const next = safeNext(params.get("next"));
    if (!url || !key) {
      router.replace("/connexion?confirmed=1");
      return;
    }

    const supabase = createBrowserClient(url, key);
    let finished = false;
    const finish = (signedIn: boolean) => {
      if (finished) return;
      finished = true;
      router.replace(signedIn ? next : "/connexion?confirmed=1");
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish(true);
    });

    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) finish(true);
      });
    }

    const timer = window.setTimeout(() => finish(false), 2000);
    return () => {
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, [params, router]);

  return <p className="text-sm text-slate-600">Confirmation du compte…</p>;
}

export default function ConfirmEmailPage() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center px-4">
      <Suspense fallback={<p className="text-sm text-slate-600">Confirmation du compte…</p>}>
        <ConfirmSession />
      </Suspense>
    </main>
  );
}
