import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, User, CheckCircle, XCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { ManageSubscriptionButton } from "@/components/ManageSubscriptionButton";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion?redirect=/compte");

  const sub = user.subscription;
  const isActive =
    sub?.status === "ACTIVE" &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Mon compte</h1>

      {searchParams.success && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="h-5 w-5" />
          Paiement réussi ! Votre abonnement est maintenant actif.
        </div>
      )}

      <div className="mt-8 space-y-6">
        <section className="card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-brand-600" />
            <h2 className="text-lg font-semibold">Abonnement</h2>
          </div>

          {isActive ? (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  Actif — Plan {sub!.plan === "YEARLY" ? "annuel" : "mensuel"}
                </span>
              </div>
              {sub!.currentPeriodEnd && (
                <p className="mt-2 text-sm text-slate-600">
                  Renouvellement le {formatDate(sub!.currentPeriodEnd)}
                </p>
              )}
              <ManageSubscriptionButton />
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-slate-600">
                <XCircle className="h-5 w-5" />
                <span>Aucun abonnement actif</span>
              </div>
              <Link href="/tarifs" className="btn-primary mt-4 inline-flex">
                Choisir un abonnement
              </Link>
            </div>
          )}
        </section>

        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Se déconnecter
          </button>
        </form>
      </div>
    </div>
  );
}
