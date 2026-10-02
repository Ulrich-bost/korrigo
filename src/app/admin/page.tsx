import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronRight, Lock, Unlock, Users } from "lucide-react";
import { ActivityChart, MixRing } from "@/components/AdminCharts";
import { getCurrentUser } from "@/lib/auth";
import { getExamCatalog } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getI18n } from "@/i18n/get-i18n";
import { localizeName } from "@/i18n/catalog-labels";
import { formatDate } from "@/lib/utils";
import { formatDzd, formatFcfa } from "@/lib/plans";

export default async function AdminPage() {
  const { locale, dict } = getI18n();
  const t = dict.admin;
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) redirect("/");

  const now = new Date();
  const isSuper = user.role === "super_admin";
  const supabase = createSupabaseServerClient();
  const [exams, studentCountRes, accountCountRes, subscriptionRows, paymentRows, accountRows, correctionResult] =
    await Promise.all([
      getExamCatalog(),
      supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("status, current_period_end"),
      supabase
        .from("payments")
        .select("id, status, amount, currency, operator, created_at, profiles(full_name, email)")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at, subscriptions(status, current_period_end)")
        .match(isSuper ? {} : { role: "student" })
        .order("created_at", { ascending: false })
        .limit(8),
      supabase.from("corrections").select("exam_id, body, file_path"),
    ]);

  const correctionsKnown = !correctionResult.error;
  const correctedIds = new Set(
    ((correctionResult.data ?? []) as CorrectionRow[])
      .filter((row) => Boolean((row.body ?? "").trim() || row.file_path))
      .map((row) => row.exam_id)
  );

  const subjects = [...exams].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const subjectCount = exams.length;
  const freeCount = exams.filter((exam) => exam.isFree).length;
  const paidCount = subjectCount - freeCount;
  const withCorrection = subjects.filter((exam) => correctedIds.has(exam.id)).length;
  const studentCount = studentCountRes.count ?? 0;
  const accountTotal = accountCountRes.count ?? 0;
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
  const recentPayments = payments.slice(0, 8);
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

  const collectedLabel = collected
    .filter((row) => row.amount > 0)
    .map((row) => formatMoney(row.amount, row.currency))
    .join(" · ");

  const freeShare = subjectCount === 0 ? 0 : Math.round((freeCount / subjectCount) * 100);
  const paidShare = subjectCount === 0 ? 0 : Math.round((paidCount / subjectCount) * 100);
  const correctionShare =
    !correctionsKnown || subjectCount === 0 ? 0 : Math.round((withCorrection / subjectCount) * 100);
  const studentShare = accountTotal === 0 ? 0 : Math.round((studentCount / accountTotal) * 100);
  const firstName = user.name.split(" ")[0] || user.name;
  const scopeText = isSuper
    ? t.scopeAll
    : user.scopes.length === 0
      ? t.none
      : user.scopes
          .map((scope) => {
            const department = localizeName(scope.departmentName, locale);
            if (scope.programName && scope.level) {
              return t.scopeProgramLabel(department, localizeName(scope.programName, locale), scope.level);
            }
            return scope.level ? t.scopeLimited(department, scope.level) : department;
          })
          .join(" · ");

  const stats = [
    {
      label: t.subjects,
      value: String(subjectCount),
      hint: correctionsKnown ? t.withCorrection(withCorrection) : undefined,
      meter: correctionShare,
      icon: BookOpen,
      tone: "brand" as const,
    },
    {
      label: t.freeSubjects,
      value: String(freeCount),
      hint: t.shareOfCatalog(freeShare),
      meter: freeShare,
      icon: Unlock,
      tone: "brand" as const,
    },
    {
      label: t.paidSubjects,
      value: String(paidCount),
      hint: t.shareOfCatalog(paidShare),
      meter: paidShare,
      icon: Lock,
      tone: "ai" as const,
    },
    {
      label: t.students,
      value: String(studentCount),
      hint: isSuper ? t.accountsTotal(accountTotal) : undefined,
      meter: isSuper ? studentShare : 0,
      icon: Users,
      tone: "brand" as const,
    },
  ];

  const finance = [
    { label: t.activeAccess, value: String(activeAccess) },
    { label: t.paymentsOk, value: String(paymentCounts.SUCCESSFUL ?? 0) },
    { label: t.paymentsPending, value: String(paymentCounts.PENDING ?? 0) },
    { label: t.paymentsFailed, value: String(paymentCounts.FAILED ?? 0) },
    { label: t.collected, value: collectedLabel || t.none },
  ];

  const byDepartment = new Map<string, number>();
  for (const exam of exams) {
    const name = exam.department || t.none;
    byDepartment.set(name, (byDepartment.get(name) ?? 0) + 1);
  }
  const departmentBars = [...byDepartment.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const departmentMax = departmentBars[0]?.[1] ?? 1;
  const recentSubjects = subjects.slice(0, 8);
  const activity = monthSeries(subjects, locale);
  const publishedInWindow = activity.reduce((sum, point) => sum + point.value, 0);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t.overview}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand-900 sm:text-3xl">{t.hello(firstName)}</h1>
          <p className="mt-1 text-sm text-slate-500">{scopeText}</p>
        </div>
        <Link href="/admin/sujets" className="btn-primary">
          {t.publish}
        </Link>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t.overview}>
        {stats.map((card) => {
          const Icon = card.icon;
          const accent = card.tone === "ai";
          return (
            <article key={card.label} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_10px_30px_rgba(0,54,28,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                    accent ? "bg-ai-50 text-ai-600" : "bg-brand-50 text-brand-700"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <p className={`mt-3 text-3xl font-semibold tracking-tight ${accent ? "text-ai-600" : "text-brand-900"}`}>
                {card.value}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-brand-50">
                <div
                  className={`h-full rounded-full ${accent ? "bg-ai-500" : "bg-brand-700"}`}
                  style={{ width: `${Math.max(card.meter, card.meter > 0 ? 8 : 0)}%` }}
                />
              </div>
              {card.hint ? <p className="mt-2 text-xs text-slate-500">{card.hint}</p> : <p className="mt-2 h-4" aria-hidden="true" />}
            </article>
          );
        })}
      </section>

      <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.9fr)]">
        <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_10px_30px_rgba(0,54,28,0.05)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-brand-900">{t.trendTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{t.trendLead}</p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
              {publishedInWindow}
            </span>
          </div>
          <div className="mt-2">
            <ActivityChart points={activity} />
          </div>
          {publishedInWindow === 0 ? <p className="text-sm text-slate-500">{t.emptyTrend}</p> : null}
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_10px_30px_rgba(0,54,28,0.05)]">
          <h2 className="text-base font-semibold text-brand-900">{t.mixTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.mixLead}</p>
          <div className="mt-5">
            <MixRing free={freeCount} paid={paidCount} totalLabel={t.papersUnit} freeLabel={t.free} paidLabel={t.paid} />
          </div>
          <dl className="mt-6 space-y-3 border-t border-brand-100 pt-5">
            {finance.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-slate-500">{item.label}</dt>
                <dd className="font-semibold text-brand-900">{item.value}</dd>
              </div>
            ))}
          </dl>
          {departmentBars.length > 0 ? (
            <div className="mt-5 border-t border-brand-100 pt-5">
              <h3 className="text-sm font-semibold text-brand-900">{t.faculty}</h3>
              <ul className="mt-4 space-y-3">
                {departmentBars.map(([name, count]) => (
                  <li key={name}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-slate-600">{localizeName(name, locale)}</span>
                      <span className="font-semibold text-brand-900">{count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-50">
                      <div
                        className="h-full rounded-full bg-brand-700"
                        style={{ width: `${Math.max(8, Math.round((count / departmentMax) * 100))}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>

      <section className="mt-4 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-[0_10px_30px_rgba(0,54,28,0.05)]">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <h2 className="text-base font-semibold text-brand-900">{t.latest}</h2>
          <Link href="/admin/sujets" className="inline-flex items-center text-sm font-medium text-brand-700 hover:text-brand-800">
            {t.manage}
            <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
        {recentSubjects.length === 0 ? (
          <p className="border-t border-brand-100 px-5 py-8 text-sm text-slate-500">{t.emptySubjects}</p>
        ) : (
          <div className="overflow-x-auto border-t border-brand-100">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-50/80 text-start text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t.colTitle}</th>
                  <th className="px-3 py-3 font-semibold">{t.colFaculty}</th>
                  <th className="px-3 py-3 font-semibold">{t.colLevel}</th>
                  <th className="px-3 py-3 font-semibold">{t.colFree}</th>
                  <th className="px-3 py-3 font-semibold">{t.colCorrection}</th>
                  <th className="px-5 py-3 font-semibold">{t.colDate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {recentSubjects.map((exam) => {
                  const corrected = correctedIds.has(exam.id);
                  return (
                    <tr key={exam.id} className="hover:bg-brand-50/40">
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/sujets/${exam.id}`} className="font-medium text-brand-900 hover:underline">
                          {exam.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500">{localizeName(exam.faculty, locale)}</p>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">{localizeName(exam.department, locale)}</td>
                      <td className="px-3 py-3.5 text-slate-600">{exam.level}</td>
                      <td className="px-3 py-3.5">
                        <span className={exam.isFree ? "badge-free" : "badge-premium"}>{exam.isFree ? t.free : t.paid}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={corrected ? "badge-free" : "text-xs text-slate-400"}>
                          {correctionsKnown ? (corrected ? t.correctionPresent : t.correctionMissing) : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDate(exam.createdAt, locale)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_10px_30px_rgba(0,54,28,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-brand-900">{t.recentAccounts}</h2>
            {isSuper ? (
              <Link href="/admin/comptes" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                {t.navAccounts}
              </Link>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">{isSuper ? t.accountsLeadAll : t.accountsLead}</p>
          {accounts.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">{t.emptyAccounts}</p>
          ) : (
            <ul className="mt-4 divide-y divide-brand-50">
              {accounts.map((account) => {
                const sub = account.subscription;
                const active =
                  sub?.status === "active" &&
                  (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > now);
                return (
                  <li key={account.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-brand-900">{account.name}</span>
                      <span className="block truncate text-sm text-slate-500">{account.email}</span>
                    </span>
                    <span className="text-end">
                      <span className="block text-sm text-slate-600">
                        {account.role === "super_admin" ? t.roleSuper : account.role === "admin" ? t.roleAdmin : t.roleUser}
                      </span>
                      <span className={active ? "badge-free mt-1" : "mt-1 block text-xs text-slate-400"}>
                        {active ? t.accessActive : t.accessNone}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5 shadow-[0_10px_30px_rgba(0,54,28,0.05)]">
          <h2 className="text-lg font-semibold text-brand-900">{t.recentPayments}</h2>
          <p className="mt-1 text-sm text-slate-500">{isSuper ? t.paymentsLeadAll : t.paymentsLead}</p>
          {recentPayments.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">{t.emptyPayments}</p>
          ) : (
            <ul className="mt-4 divide-y divide-brand-50">
              {recentPayments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-brand-900">{payment.user.name || payment.user.email}</span>
                    <span className="block text-sm text-slate-500">
                      {formatDate(payment.createdAt, locale)} · {payment.operator === "card" ? t.methodCard : t.methodCcp}
                    </span>
                  </span>
                  <span className="text-end">
                    <span className="block text-sm font-semibold text-brand-900">{formatMoney(payment.amount, payment.currency)}</span>
                    <span className={payment.status === "FAILED" ? "badge-ai mt-1" : payment.status === "SUCCESSFUL" ? "badge-free mt-1" : "mt-1 block text-xs text-slate-500"}>
                      {paymentStatusLabel(payment.status, t)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
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

interface CorrectionRow {
  exam_id: string;
  body: string | null;
  file_path: string | null;
}

function monthSeries(exams: { createdAt: string }[], locale: string) {
  const now = new Date();
  const tag = locale === "ar" ? "ar" : locale === "en" ? "en" : "fr";
  const points: { label: string; value: number }[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    const value = exams.filter((exam) => {
      const created = new Date(exam.createdAt);
      return created >= start && created < end;
    }).length;
    points.push({
      label: start.toLocaleDateString(tag, { month: "short" }).replace(".", ""),
      value,
    });
  }
  return points;
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
