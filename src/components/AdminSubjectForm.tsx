"use client";

import { useFormState } from "react-dom";
import { createSubjectAction } from "@/app/actions/admin";

interface Props {
  universities: { id: string; name: string }[];
}

export function AdminSubjectForm({ universities }: Props) {
  const [state, formAction] = useFormState(createSubjectAction, undefined);

  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Ajouter un sujet</h2>
      <form action={formAction} className="mt-6 space-y-4">
        {state?.error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</div>
        )}
        <div>
          <label className="label">Titre</label>
          <input name="title" required className="input" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" rows={2} className="input" />
        </div>
        <div>
          <label className="label">Université</label>
          <select name="universityId" required className="input">
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Filière</label>
            <input name="faculty" required placeholder="Mathématiques" className="input" />
          </div>
          <div>
            <label className="label">Niveau</label>
            <input name="level" required placeholder="1, 2, 3..." className="input" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Année</label>
            <input name="year" type="number" required defaultValue={2025} className="input" />
          </div>
          <div>
            <label className="label">Semestre</label>
            <input name="semester" placeholder="S1, S2..." className="input" />
          </div>
        </div>
        <div>
          <label className="label">Type d&apos;examen</label>
          <input name="examType" required placeholder="Partiel, Final..." className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input name="isPremium" type="checkbox" defaultChecked className="rounded" />
          Contenu premium (réservé aux abonnés)
        </label>
        <button type="submit" className="btn-primary w-full">Publier</button>
      </form>
    </div>
  );
}
