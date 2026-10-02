import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, User, CheckCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getAcademicTree } from "@/lib/catalog";
import { formatDate } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { addExamDateAction, updateProfileAction } from "@/app/actions/account";
import { syncLatestPayment } from "@/app/actions/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STUDY_LEVELS } from "@/lib/taxonomy";
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
  const sub =
    user.subscriptions.find((item) => item.programId === user.programId && item.status === "active") ??
    user.subscriptions.find((item) => item.status === "active");
  const isActive = !!sub && (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());
  const tree = await getAcademicTree();
  const supabase = createSupabaseServerClient();
  const { data: schedules } = await supabase
    .from("student_exam_schedules")
    .select("id, label, exam_on")
    .eq("profile_id", user.id)
    .order("exam_on");

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

        <section className="card">
          <h2 className="text-lg font-semibold">{t.program}</h2>
          <form action={updateProfileAction} className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="programId">{t.program}</label>
              <select id="programId" name="programId" required className="input" defaultValue={user.programId ?? ""}>
                <option value="" disabled>{t.chooseFaculty}</option>
                {tree.map((department) => (
                  <optgroup key={department.id} label={department.name}>
                    {department.programs.map((program) => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="level">{dict.admin.level}</label>
              <select id="level" name="level" required className="input" defaultValue={user.level ?? "L1"}>
                {STUDY_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="objectives">{t.objectives}</label>
              <textarea id="objectives" name="objectives" rows={3} className="input" defaultValue={user.objectives ?? ""} />
            </div>
            <button type="submit" className="btn-primary">{t.saveProfile}</button>
          </form>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold">{t.scheduleTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{t.scheduleLead}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {(schedules ?? []).map((item) => {
              const examOn = new Date(item.exam_on);
              const remind14 = new Date(examOn);
              remind14.setDate(remind14.getDate() - 14);
              const remind7 = new Date(examOn);
              remind7.setDate(remind7.getDate() - 7);
              return (
                <li key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-medium">{item.label}</span>
                  <span className="mt-1 block text-slate-500">
                    {formatDate(item.exam_on, locale)} · {t.reminder(formatDate(remind14, locale))} · {t.reminder(formatDate(remind7, locale))}
                  </span>
                </li>
              );
            })}
          </ul>
          <form action={addExamDateAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input name="label" required placeholder={t.examLabel} className="input" />
            <input name="examOn" type="date" required className="input" />
            <button type="submit" className="btn-secondary sm:col-span-2">{t.addDate}</button>
          </form>
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
