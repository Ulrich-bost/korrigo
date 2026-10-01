import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AdminSubjectForm } from "@/components/AdminSubjectForm";
import { CATALOG } from "@/lib/taxonomy";
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
  if (!user || user.role !== "ADMIN") redirect("/");

  const now = new Date();
  const [subjects, subjectCount, userCount, activeAccess, paymentCounts, collected, accounts, payments] =
    await Promise.all([
      prisma.subject.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.subject.count(),
      prisma.user.count(),
      prisma.subscription.count({
        where: {
          status: "ACTIVE",
          OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
        },
      }),
      prisma.payment.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.payment.groupBy({
        by: ["currency"],
        where: { status: "SUCCESSFUL" },
        _sum: { amount: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          subscription: { select: { status: true, currentPeriodEnd: true } },
        },
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  const countByStatus = Object.fromEntries(paymentCounts.map((row) => [row.status, row._count]));
  const collectedLabel = collected
    .filter((row) => (row._sum.amount ?? 0) > 0)
    .map((row) => formatMoney(row._sum.amount ?? 0, row.currency))
    .join(" · ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">{t.title}</h1>
      <p className="mt-2 text-slate-600">
        {t.summary(subjectCount, CATALOG.length, userCount)}
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
                    sub?.status === "ACTIVE" &&
                    (!sub.currentPeriodEnd || sub.currentPeriodEnd > now);
                  return (
                    <tr key={account.id}>
                      <td className="px-4 py-3">{account.name}</td>
                      <td className="px-4 py-3">{account.email}</td>
                      <td className="px-4 py-3">{account.role === "ADMIN" ? t.roleAdmin : t.roleUser}</td>
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
        <AdminSubjectForm departments={CATALOG.map((item) => item.name)} />
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
                  <td className="px-4 py-3">{s.isPremium ? t.no : t.yes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
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
