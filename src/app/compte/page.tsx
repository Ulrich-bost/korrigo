import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, User, CheckCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { syncLatestPayment } from "@/app/actions/subscription";
import { getI18n } from "@/i18n/get-i18n";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string };
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/connexion?redirect=/compte");

  if (searchParams.success) {
    await syncLatestPayment();
  }

  const { locale, dict } = getI18n();
  const t = dict.account;
  const user = (await getCurrentUser()) ?? sessionUser;
  const sub = user.subscription;
  const isActive =
    sub?.status === "ACTIVE" &&
    (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{t.title}</h1>

      {searchParams.success && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle className="h-5 w-5" />
          {isActive ? t.paid : t.pending}
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
            <h2 className="text-lg font-semibold">{isActive ? t.access : t.mySubjects}</h2>
          </div>

          {isActive ? (
            <div className="mt-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{t.fullAccess}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {sub!.currentPeriodEnd
                  ? t.until(formatDate(sub!.currentPeriodEnd, locale))
                  : t.noEnd}
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-slate-600">
                {t.pickFaculty}
              </p>
              <Link href="/sujets" className="btn-secondary mt-4 inline-flex">
                {t.chooseFaculty}
              </Link>
            </div>
          )}
        </section>

        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            {t.logout}
          </button>
        </form>
      </div>
    </div>
  );
}
