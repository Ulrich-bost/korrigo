"use client";

import { Suspense } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/actions/auth";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/sujets";
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) =>
      loginAction(formData),
    undefined
  );

  return (
    <div className="card">
      <h1 className="text-2xl font-bold">Connexion</h1>
      <p className="mt-2 text-sm text-slate-600">
        Accédez à votre faculté et votre filière
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        {state?.error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        <input type="hidden" name="redirect" value={redirectTo} />
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">Mot de passe</label>
          <input id="password" name="password" type="password" required className="input" />
        </div>
        <button type="submit" className="btn-primary w-full">
          Se connecter
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-brand-600 hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <Suspense fallback={<div className="card text-sm text-slate-500">Chargement...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
