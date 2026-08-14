"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) =>
      registerAction(formData),
    undefined
  );

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="card">
        <h1 className="text-2xl font-bold">Créer un compte</h1>
        <p className="mt-2 text-sm text-slate-600">
          Rejoignez des milliers d&apos;étudiants
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          {state?.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="label">Nom complet</label>
            <input id="name" name="name" type="text" required className="input" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label htmlFor="password" className="label">Mot de passe</label>
            <input id="password" name="password" type="password" required minLength={8} className="input" />
            <p className="mt-1 text-xs text-slate-500">Minimum 8 caractères</p>
          </div>
          <button type="submit" className="btn-primary w-full">
            S&apos;inscrire
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-brand-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
