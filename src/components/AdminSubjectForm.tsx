"use client";

import { useFormState } from "react-dom";
import { createSubjectAction } from "@/app/actions/admin";
import { STUDY_LEVELS } from "@/lib/taxonomy";

interface Props {
  departments: string[];
}

export function AdminSubjectForm({ departments }: Props) {
  const [state, formAction] = useFormState(
    async (_: { error?: string } | undefined, formData: FormData) =>
      createSubjectAction(formData),
    undefined
  );

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
          <label className="label">Énoncé et corrigé</label>
          <textarea name="content" rows={6} className="input" placeholder="Texte du sujet et de la correction" />
        </div>
        <div>
          <label className="label">Faculté ou institut</label>
          <input
            name="department"
            required
            list="departments"
            placeholder="Faculté des sciences"
            className="input"
          />
          <datalist id="departments">
            {departments.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Filière</label>
            <input name="faculty" required placeholder="Mathématiques" className="input" />
          </div>
          <div>
            <label className="label">Niveau</label>
            <select name="level" required className="input" defaultValue="L1">
              {STUDY_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
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
          Hors des 3 premiers sujets du niveau (après « Voir plus »)
        </label>
        <button type="submit" className="btn-primary w-full">Publier</button>
      </form>
    </div>
  );
}
