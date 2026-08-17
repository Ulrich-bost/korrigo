"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface SubjectFiltersProps {
  universities: { id: string; name: string }[];
  faculties: string[];
  current: {
    q?: string;
    university?: string;
    faculty?: string;
    year?: string;
  };
}

export function SubjectFilters({ universities, faculties, current }: SubjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/sujets?${params.toString()}`);
  }

  return (
    <form
      className="mt-8 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        fd.forEach((v, k) => {
          if (v) params.set(k, v.toString());
        });
        router.push(`/sujets?${params.toString()}`);
      }}
    >
      <div className="lg:col-span-2">
        <label className="label">Recherche</label>
        <input
          name="q"
          defaultValue={current.q ?? ""}
          placeholder="Matière, titre..."
          className="input"
        />
      </div>
      <div>
        <label className="label">Université</label>
        <select
          name="university"
          defaultValue={current.university ?? ""}
          className="input"
          onChange={(e) => update("university", e.target.value)}
        >
          <option value="">Toutes</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Filière</label>
        <select name="faculty" defaultValue={current.faculty ?? ""} className="input">
          <option value="">Toutes</option>
          {faculties.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Année</label>
        <select name="year" defaultValue={current.year ?? ""} className="input">
          <option value="">Toutes</option>
          {[2026, 2025, 2024, 2023, 2022].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end sm:col-span-2 lg:col-span-5">
        <button type="submit" className="btn-primary">
          Filtrer
        </button>
      </div>
    </form>
  );
}
