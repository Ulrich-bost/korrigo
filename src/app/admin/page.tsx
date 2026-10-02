import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getAcademicTree, getExamCatalog } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminSubjectForm } from "@/components/AdminSubjectForm";
import { getI18n } from "@/i18n/get-i18n";
import { localizeName } from "@/i18n/catalog-labels";
import { formatDate } from "@/lib/utils";
import { formatDzd, formatFcfa } from "@/lib/plans";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { created?: string };
}) {
  const { locale, dict } = getI18n();
  const t = dict.admin;
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) redirect("/");

  const now = new Date();
  const isSuper = user.role === "super_admin";
  const supabase = createSupabaseServerClient();
  const [tree, exams, profileCount, subscriptionRows, paymentRows, accountRows] = await Promise.all([
    getAcademicTree(),
    getExamCatalog(),
    isSuper
      ? supabase.from("profiles").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: 0 }),
    isSuper
      ? supabase.from("subscriptions").select("status, current_period_end")
      : Promise.resolve({ data: [] as { status: string; current_period_end: string | null }[] }),
    isSuper
      ? supabase.from("payments").select("status, amount, currency, operator, created_at, profiles(full_name, email)").order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as PaymentRow[] }),
    isSuper
      ? supabase.from("profiles").select("id, full_name, email, role, created_at, subscriptions(status, current_period_end)").order("created_at", { ascending: false }).limit(8)
      : Promise.resolve({ data: [] as AccountRow[] }),
  ]);

  const subjects = [...exams].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  const subjectCount = exams.length;
  const userCount = profileCount.count ?? 0;
  const activeAccess = (subscriptionRows.data ?? []).filter((row) => {
    return row.status === "active" && (!row.current_period_end || new Date(row.current_period_end) > now);
  }).length;
  const payments = ((paymentRows.data ?? []) as PaymentRow[]).map((payment) => {
    const profile = Array.isArray(payment.profiles) ? payment.profiles[0] : payment.profiles;
    return {
      id: payment.id,
      createdAt: payment.created_at,
      amount: payment.amount,
      currency: payment.currency,
      operator: payment.operator,
      status: payment.status.toUpperCase(),
      user: { name: profile?.full_name ?? "", email: profile?.email ?? "" },
    };
  });
  const paymentCounts = payments.reduce<Record<string, number>>((acc, payment) => {
    acc[payment.status] = (acc[payment.status] ?? 0) + 1;
    return acc;
  }, {});
  const collectedMap = new Map<string, number>();
  for (const payment of payments) {
    if (payment.status !== "SUCCESSFUL") continue;
    collectedMap.set(payment.currency, (collectedMap.get(payment.currency) ?? 0) + payment.amount);
  }
  const collected = [...collectedMap.entries()].map(([currency, amount]) => ({ currency, amount }));
  const accounts = ((accountRows.data ?? []) as AccountRow[]).map((account) => {
    const subscription = Array.isArray(account.subscriptions) ? account.subscriptions[0] : account.subscriptions;
    return {
      id: account.id,
      name: account.full_name,
      email: account.email,
      role: account.role,
      createdAt: account.created_at,
      subscription: subscription
        ? { status: subscription.status, currentPeriodEnd: subscription.current_period_end }
        : null,
    };
  });

  const countByStatus = paymentCounts;
  const collectedLabel = collected
    .filter((row) => row.amount > 0)
    .map((row) => formatMoney(row.amount, row.currency))
    .join(" · ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <p className="mt-2 text-slate-600">
        {t.summary(subjectCount, tree.length, userCount)}
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">{t.overview}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: t.subjects, value: String(subjectCount) },
            { label: t.accounts, value: String(userCount) },
            { label: t.activeAccess, value: String(activeAccess) },
            { label: t.paymentsOk, value: String(countByStatus.SUCCESSFUL ?? 0) },
            { label: t.paymentsPending, value: String(countByStatus.PENDING ?? 0) },
            { label: t.paymentsFailed, value: String(countByStatus.FAILED ?? 0) },
          ].map((card) => (
            <div key={card.label} className="card">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-2 text-3xl font-bold">{card.value}</p>
            </div>
          ))}
          <div className="card sm:col-span-2 lg:col-span-3">
            <p className="text-sm text-slate-500">{t.collected}</p>
            <p className="mt-2 text-2xl font-bold">{collectedLabel || t.none}</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">{t.recentAccounts}</h2>
        {accounts.length === 0 ? (
          <p className="mt-4 text-slate-500">{t.emptyAccounts}</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t.colName}</th>
                  <th className="px-4 py-3 text-start font-medium">{t.colEmail}</th>
                  <th className="px-4 py-3 text-start font-medium">{t.colRole}</th>
                  <th className="px-4 py-3 text-start font-medium">{t.colJoined}</th>
                  <th className="px-4 py-3 text-start font-medium">{t.colAccess}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {accounts.map((account) => {
                  const sub = account.subscription;
                  const active =
                    sub?.status === "active" &&
                    (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > now);
                  return (
                    <tr key={account.id}>
                      <td className="px-4 py-3">{account.name}</td>
                      <td className="px-4 py-3">{account.email}</td>
                      <td className="px-4 py-3">
                        {account.role === "super_admin" ? t.roleSuper : account.role === "admin" ? t.roleAdmin : t.roleUser}
                      </td>
                      <td className="px-4 py-3">{formatDate(account.createdAt, locale)}</td>
                      <td className="px-4 py-3">{active ? t.accessActive : t.accessNone}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">{t.recentPayments}</h2>
        {payments.length === 0 ? (
          <p className="mt-4 text-slate-500">{t.emptyPayments}</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t.colDate}</th>
                  <th className="px-4 py-3 text-start font-medium">{t.colName}</th>
                  <th className="px-4 py-3 text-start font-medium">{t.colAmount}</th>
                  <th className="px-4 py-3 text-start font-medium">{t.colMethod}</th>
                  <th className="px-4 py-3 text-start font-medium">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3">{formatDate(payment.createdAt, locale)}</td>
                    <td className="px-4 py-3">
                      <span className="block">{payment.user.name}</span>
                      <span className="text-slate-500">{payment.user.email}</span>
                    </td>
                    <td className="px-4 py-3">{formatMoney(payment.amount, payment.currency)}</td>
                    <td className="px-4 py-3">{payment.operator === "card" ? t.methodCard : t.methodCcp}</td>
                    <td className="px-4 py-3">{paymentStatusLabel(payment.status, t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {searchParams.created && (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {t.created}
        </div>
      )}

      <div className="mt-10 max-w-xl">
        <AdminSubjectForm departments={tree.map((item) => item.name)} />
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">{t.latest}</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-start font-medium">{t.colTitle}</th>
                <th className="px-4 py-3 text-start font-medium">{t.colFaculty}</th>
                <th className="px-4 py-3 text-start font-medium">{t.colFiliere}</th>
                <th className="px-4 py-3 text-start font-medium">{t.colLevel}</th>
                <th className="px-4 py-3 text-start font-medium">{t.colFree}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {subjects.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3">
                    <Link href={`/sujets/${s.slug}`} className="text-brand-600 hover:underline">
                      {s.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{localizeName(s.department, locale)}</td>
                  <td className="px-4 py-3">{localizeName(s.faculty, locale)}</td>
                  <td className="px-4 py-3">{s.level}</td>
                  <td className="px-4 py-3">{s.isFree ? t.yes : t.no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

interface PaymentRow {
  id: string;
  status: string;
  amount: number;
  currency: string;
  operator: string | null;
  created_at: string;
  profiles: { full_name: string; email: string } | { full_name: string; email: string }[] | null;
}

interface AccountRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  subscriptions:
    | { status: string; current_period_end: string | null }
    | { status: string; current_period_end: string | null }[]
    | null;
}

function formatMoney(amount: number, currency: string) {
  if (currency === "DZD") return formatDzd(amount);
  if (currency === "XAF" || currency === "XOF") return formatFcfa(amount);
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

function paymentStatusLabel(
  status: string,
  labels: { statusPending: string; statusSuccessful: string; statusFailed: string }
) {
  if (status === "SUCCESSFUL") return labels.statusSuccessful;
  if (status === "FAILED") return labels.statusFailed;
  return labels.statusPending;
}
