"use client";

import { useFormState } from "react-dom";
import { createUniversityAction } from "@/app/actions/admin";

export function AdminUniversityForm() {
  const [state, formAction] = useFormState(createUniversityAction, undefined);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Ajouter une université</h2>
      <form action={formAction} className="mt-6 space-y-4">
        {state?.error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
        )}
        <div>
          <label className="label">Nom</label>
          <input name="name" required placeholder="Université Paris-Saclay" className="input" />
        </div>
        <div>
          <label className="label">Ville</label>
          <input name="city" placeholder="Paris" className="input" />
        </div>
        <button type="submit" className="btn-secondary w-full">Ajouter</button>
      </form>
    </div>
  );
}
