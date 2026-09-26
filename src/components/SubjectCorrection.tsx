import { Download } from "lucide-react";

const FALLBACK_CONTENT = `Exercice 1 — Analyse (8 points)

Étudier la convergence de la série ∑ (1/n²) et déterminer sa somme.

Correction :
Il s'agit d'une série de Riemann avec p = 2 > 1, donc convergente. Sa somme vaut π²/6 (problème de Bâle).

Exercice 2 — Algèbre linéaire (12 points)

Soit A une matrice 3×3. Déterminer les valeurs propres et diagonaliser A.

Correction :
χ_A(λ) = det(A − λI). Les valeurs propres sont λ₁ = 1, λ₂ = 2, λ₃ = −1. La matrice est diagonalisable dans une base de vecteurs propres.`;

export function SubjectCorrection({
  content,
  fileUrl,
}: {
  content?: string | null;
  fileUrl?: string | null;
}) {
  const text = (content && content.trim()) || FALLBACK_CONTENT;

  return (
    <div>
      <h2 className="font-semibold text-slate-900">Sujet et corrigé</h2>
      <div className="mt-4 whitespace-pre-wrap rounded-lg bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-inner">
        {text}
      </div>
      {fileUrl && (
        <a href={fileUrl} className="btn-primary mt-4 inline-flex gap-2">
          <Download className="h-4 w-4" />
          Télécharger le PDF
        </a>
      )}
    </div>
  );
}
