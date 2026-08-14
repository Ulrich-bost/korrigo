"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) =>
      loginAction(formData),
    undefined
  );

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="mt-2 text-sm text-slate-600">
          Accédez à votre compte UnivSujets
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          {state?.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}
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
    </div>
  );
}
