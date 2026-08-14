export default function LegalPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="prose prose-slate mt-8 max-w-none text-slate-600">
        <p>
          Cette page est un placeholder. Remplacez ce contenu par vos mentions légales,
          conditions générales de vente ou politique de confidentialité conformes à votre
          activité et à la réglementation applicable (RGPD, etc.).
        </p>
      </div>
    </div>
  );
}
