import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, CheckCircle, CreditCard, GraduationCap, Layers, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getAcademicTree } from "@/lib/catalog";
import { formatDate } from "@/lib/utils";
import { addExamDateAction, updatePasswordAction, updateProfileAction } from "@/app/actions/account";
import { LogoutZone } from "@/components/LogoutZone";
import { SubmitButton } from "@/components/SubmitButton";
import { syncLatestPayment } from "@/app/actions/subscription";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STUDY_LEVELS } from "@/lib/taxonomy";
import { getI18n } from "@/i18n/get-i18n";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { success?: string; canceled?: string; error?: string; saved?: string };
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/connexion?redirect=/compte");
  if (sessionUser.role === "admin" || sessionUser.role === "super_admin") redirect("/admin/profil");

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
  const isStudent = user.role === "student";
  const tree = isStudent ? await getAcademicTree() : [];
  const placement = tree
    .flatMap((department) => department.programs.map((program) => ({ department, program })))
    .find((item) => item.program.id === user.programId);
  const firstName = user.name.split(" ")[0] || user.name;
  const savedMessage = searchParams.saved === "name" ? t.nameSaved : searchParams.saved === "password" ? t.passwordSaved : null;
  const errorMessage =
    searchParams.error && searchParams.error in dict.errors
      ? dict.errors[searchParams.error as keyof typeof dict.errors]
      : null;
  const supabase = createSupabaseServerClient();
  const { data: schedules } = isStudent
    ? await supabase
        .from("student_exam_schedules")
        .select("id, label, exam_on")
        .eq("profile_id", user.id)
        .order("exam_on")
    : { data: [] };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-ai-600">{t.title}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
          {isStudent ? dict.space.hello(firstName) : user.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{user.email}</p>
        {isStudent && (
          <p className="mt-3 text-sm font-medium text-brand-800">
            {[placement?.department.name, placement?.program.name, user.level].filter(Boolean).join(" · ")}
          </p>
        )}
      </header>

      {searchParams.success && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircle className="h-5 w-5" />
          {isActive ? t.paid : t.pending}
        </div>
      )}

      {savedMessage && (
        <div role="status" className="mt-6 flex items-center gap-2 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CheckCircle className="h-5 w-5" />
          {savedMessage}
        </div>
      )}

      {errorMessage && (
        <div role="alert" className="mt-6 rounded-lg bg-ai-50 px-4 py-3 text-sm text-ai-800">
          {errorMessage}
        </div>
      )}

      {isStudent ? (
        <>
          <section className="card mt-8 border-brand-200">
            <h2 className="text-xl font-semibold text-brand-900">{t.path}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.pickFaculty}</p>
            <form action={updateProfileAction} className="mt-6 space-y-4">
              <div>
                <label className="label" htmlFor="name">{dict.auth.name}</label>
                <input id="name" name="name" required minLength={2} autoComplete="name" className="input" defaultValue={user.name} />
              </div>
              <div>
                <label className="label flex items-center gap-1.5" htmlFor="programId">
                  <GraduationCap className="h-4 w-4 text-brand-700" aria-hidden />
                  {t.program}
                </label>
                <select id="programId" name="programId" required className="input" defaultValue={user.programId ?? ""}>
                  {placement ? (
                    placement.department.programs.map((program) => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="" disabled>{t.chooseFaculty}</option>
                      {tree.map((department) => (
                        <optgroup key={department.id} label={department.name}>
                          {department.programs.map((program) => (
                            <option key={program.id} value={program.id}>{program.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="label flex items-center gap-1.5" htmlFor="level">
                  <Layers className="h-4 w-4 text-brand-700" aria-hidden />
                  {dict.space.changeLevel}
                </label>
                <select id="level" name="level" required className="input" defaultValue={user.level ?? "L1"}>
                  {STUDY_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-slate-500">{dict.space.levelHint}</p>
              </div>
              <div>
                <label className="label" htmlFor="objectives">{t.objectives}</label>
                <textarea id="objectives" name="objectives" rows={3} className="input" defaultValue={user.objectives ?? ""} />
              </div>
              <SubmitButton pendingLabel={dict.auth.loading}>{t.saveProfile}</SubmitButton>
            </form>

            <form action={updatePasswordAction} className="mt-8 space-y-4 border-t border-brand-100 pt-6">
              <div>
                <label className="label" htmlFor="password">{dict.auth.password}</label>
                <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
                <p className="mt-1.5 text-xs text-slate-500">{dict.auth.minChars}</p>
              </div>
              <div>
                <label className="label" htmlFor="passwordConfirm">{t.passwordConfirm}</label>
                <input id="passwordConfirm" name="passwordConfirm" type="password" required minLength={8} autoComplete="new-password" className="input" />
              </div>
              <SubmitButton variant="secondary" pendingLabel={dict.auth.loading}>{t.saveProfile}</SubmitButton>
            </form>
          </section>

          <div className="mt-6 grid items-start gap-6 md:grid-cols-2">
            <section className="card">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-brand-700" />
                <h2 className="text-lg font-semibold text-brand-900">{t.scheduleTitle}</h2>
              </div>
              <p className="mt-2 text-sm text-slate-600">{t.scheduleLead}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {(schedules ?? []).map((item) => {
                  const examOn = new Date(item.exam_on);
                  const remind14 = new Date(examOn);
                  remind14.setDate(remind14.getDate() - 14);
                  const remind7 = new Date(examOn);
                  remind7.setDate(remind7.getDate() - 7);
                  return (
                    <li key={item.id} className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
                      <span className="font-medium">{item.label}</span>
                      <span className="mt-1 block text-slate-500">
                        {formatDate(item.exam_on, locale)} · {t.reminder(formatDate(remind14, locale))} · {t.reminder(formatDate(remind7, locale))}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <form action={addExamDateAction} className="mt-4 space-y-3">
                <input name="label" required placeholder={t.examLabel} className="input" />
                <input name="examOn" type="date" required className="input" aria-label={t.examDate} />
                <SubmitButton variant="secondary" pendingLabel={dict.auth.loading}>{t.addDate}</SubmitButton>
              </form>
            </section>

            <section className="card">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-brand-700" />
                <h2 className="text-lg font-semibold text-brand-900">{isActive ? t.access : t.mySubjects}</h2>
              </div>
              {isActive ? (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-brand-700">
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
                <p className="mt-4 text-sm text-slate-600">{dict.space.lead}</p>
              )}
            </section>
          </div>

          <Link href="/espace" className="btn-primary mt-8">
            {dict.nav.exams}
          </Link>
        </>
      ) : (
        <section className="card mt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <User className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-600">{dict.admin.title}</p>
          </div>
          <Link href="/admin" className="btn-primary mt-4 inline-flex">{dict.nav.admin}</Link>
        </section>
      )}

      <LogoutZone />
    </div>
  );
}
