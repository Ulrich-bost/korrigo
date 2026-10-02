import Link from "next/link";
import { ChevronRight, FolderOpen, GraduationCap } from "lucide-react";
import { getCurrentUser, hasProgramAccess, type CurrentUser } from "@/lib/auth";
import { getAcademicTree, getExamCatalog, type AcademicDepartment } from "@/lib/catalog";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  STUDY_LEVELS,
  departmentSlug,
  filiereSlug,
  findBySlug,
  formatLevel,
  isStudyLevel,
  type StudyLevel,
} from "@/lib/taxonomy";
import { SubjectCorrection } from "@/components/SubjectCorrection";
import { rethrowNavigationError } from "@/lib/navigation-error";
import { getI18n } from "@/i18n/get-i18n";
import { localizeName } from "@/i18n/catalog-labels";

interface SearchParams {
  departement?: string;
  filiere?: string;
  niveau?: string;
}

export default async function SubjectsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  let user: CurrentUser | null = null;
  let allSubjects: Awaited<ReturnType<typeof getExamCatalog>> = [];
  let tree: Awaited<ReturnType<typeof getAcademicTree>> = [];
  let catalogueUnavailable = false;

  try {
    user = await getCurrentUser();
    tree = await getAcademicTree();
    allSubjects = await getExamCatalog();
  } catch (error) {
    rethrowNavigationError(error);
    catalogueUnavailable = true;
  }

  const visibleTree = scopeTree(tree, user);
  const { locale, dict } = getI18n();
  const t = dict.catalog;
  const departments = visibleTree.map((item) => item.name);
  const selectedDepartment = findBySlug(departments, searchParams.departement);
  const structure = visibleTree.find((item) => item.name === selectedDepartment);

  const inDepartment = selectedDepartment
    ? allSubjects.filter((s) => s.department === selectedDepartment)
    : [];
  const filieres = structure ? structure.programs.map((program) => program.name) : [];
  const selectedFiliere = findBySlug(filieres, searchParams.filiere);

  const inFiliere = selectedFiliere
    ? inDepartment.filter((s) => s.faculty === selectedFiliere)
    : [];
  const levelChoices = levelsFor(user, structure?.id);
  const selectedLevel =
    searchParams.niveau && isStudyLevel(searchParams.niveau) && levelChoices.includes(searchParams.niveau)
      ? searchParams.niveau
      : undefined;

  const levelSubjects = selectedLevel
    ? inFiliere.filter((s) => s.level === selectedLevel)
    : [];
  const selectedProgram = structure?.programs.find((program) => program.name === selectedFiliere);
  const isSubscribed = selectedProgram ? hasProgramAccess(user, selectedProgram.id) : false;
  const corrections = new Map<string, { body: string | null }>();
  const purchased = new Set<string>();
  if (user && levelSubjects.length > 0) {
    const supabase = createSupabaseServerClient();
    const [{ data: correctionRows }, { data: purchaseRows }] = await Promise.all([
      supabase.from("corrections").select("exam_id, body"),
      supabase.from("one_time_purchases").select("exam_id").eq("profile_id", user.id),
    ]);
    for (const row of correctionRows ?? []) corrections.set(row.exam_id as string, { body: row.body });
    for (const row of purchaseRows ?? []) purchased.add(row.exam_id as string);
  }
  const visibleSubjects = levelSubjects.map((subject) => {
    const correction = corrections.get(subject.id);
    const canAccess =
      !!user &&
      (user.role === "student"
        ? subject.isFree || isSubscribed || purchased.has(subject.id)
        : true);
    return { ...subject, canAccess, content: canAccess ? correction?.body ?? null : null };
  });

  const crumbs = [
    { href: "/sujets", label: t.crumbs },
    selectedDepartment
      ? {
          href: `/sujets?departement=${departmentSlug(selectedDepartment)}`,
          label: localizeName(selectedDepartment, locale),
        }
      : null,
    selectedDepartment && selectedFiliere
      ? {
          href: `/sujets?departement=${departmentSlug(selectedDepartment)}&filiere=${filiereSlug(selectedFiliere)}`,
          label: localizeName(selectedFiliere, locale),
        }
      : null,
    selectedLevel ? { href: "", label: selectedLevel } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold">
          {!selectedDepartment
            ? t.chooseFaculty
            : !selectedFiliere
              ? t.chooseFiliere
              : !selectedLevel
                ? t.chooseLevel
                : `${localizeName(selectedFiliere, locale)} · ${selectedLevel}`}
        </h1>
        <p className="mt-2 text-slate-600">
          {!selectedDepartment
            ? t.blida
            : !selectedFiliere
              ? t.selectFiliere(localizeName(selectedDepartment, locale))
              : !selectedLevel
                ? t.openLevels
                : t.levelSubjects}
        </p>
      </div>

      {(selectedDepartment || selectedFiliere) && (
        <nav className="mt-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
          {crumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-4 w-4 rtl:rotate-180" />}
              {crumb.href && index < crumbs.length - 1 ? (
                <Link href={crumb.href} className="hover:text-brand-600">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-800">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {user?.role === "student" && !user.programId && (
        <div className="mx-auto mt-10 max-w-lg card text-center">
          <h2 className="text-xl font-semibold">{dict.account.program}</h2>
          <p className="mt-2 text-sm text-slate-600">{dict.account.pickFaculty}</p>
          <Link href="/compte" className="btn-primary mt-6 inline-flex">
            {dict.account.chooseFaculty}
          </Link>
        </div>
      )}

      {!selectedDepartment && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => {
            const filiereCount = visibleTree.find((item) => item.name === department)?.programs.length ?? 0;
            return (
              <Link
                key={department}
                href={`/sujets?departement=${departmentSlug(department)}`}
                className="card group transition hover:border-brand-300 hover:shadow-md"
              >
                <FolderOpen className="h-8 w-8 text-brand-600" />
                <h2 className="mt-3 font-semibold group-hover:text-brand-700">{localizeName(department, locale)}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t.filiereCount(filiereCount)}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {selectedDepartment && !selectedFiliere && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filieres.map((filiere) => (
            <Link
              key={filiere}
              href={`/sujets?departement=${departmentSlug(selectedDepartment)}&filiere=${filiereSlug(filiere)}`}
              className="card group transition hover:border-brand-300 hover:shadow-md"
            >
              <GraduationCap className="h-8 w-8 text-brand-600" />
              <h2 className="mt-3 font-semibold group-hover:text-brand-700">{localizeName(filiere, locale)}</h2>
              <p className="mt-1 text-sm text-slate-500">{levelChoices.join(" · ")}</p>
            </Link>
          ))}
        </div>
      )}

      {selectedDepartment && selectedFiliere && !selectedLevel && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {levelChoices.map((level) => (
            <Link
              key={level}
              href={`/sujets?departement=${departmentSlug(selectedDepartment)}&filiere=${filiereSlug(selectedFiliere)}&niveau=${level}`}
              className="card group text-center transition hover:border-brand-300 hover:shadow-md"
            >
              <p className="text-2xl font-bold text-brand-700">{level}</p>
              <p className="mt-2 text-sm text-slate-500">{t.corrected}</p>
            </Link>
          ))}
        </div>
      )}

      {selectedDepartment && selectedFiliere && selectedLevel && !user && (
        <div className="mx-auto mt-10 max-w-lg card text-center">
          <h2 className="text-xl font-semibold">{t.createToSee}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t.afterSignup(localizeName(selectedFiliere, locale), selectedLevel)}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/inscription?redirect=${encodeURIComponent(`/sujets?departement=${departmentSlug(selectedDepartment)}&filiere=${filiereSlug(selectedFiliere)}&niveau=${selectedLevel}`)}`}
              className="btn-primary"
            >
              {t.createAccount}
            </Link>
            <Link
              href={`/connexion?redirect=${encodeURIComponent(`/sujets?departement=${departmentSlug(selectedDepartment)}&filiere=${filiereSlug(selectedFiliere)}&niveau=${selectedLevel}`)}`}
              className="btn-secondary"
            >
              {t.login}
            </Link>
          </div>
        </div>
      )}

      {selectedDepartment && selectedFiliere && selectedLevel && user && (
        <div className="mx-auto mt-8 max-w-4xl space-y-8">
          {visibleSubjects.map((subject) => (
            <article key={subject.id} className="card">
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-brand-700">
                  {formatLevel(subject.level)}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">
                  {subject.examType}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">
                  {t.session(subject.year)}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold">
                <Link href={`/sujets/${subject.slug}`} className="hover:text-brand-700">
                  {subject.title}
                </Link>
              </h2>
              {subject.description && (
                <p className="mt-2 text-sm text-slate-600">{subject.description}</p>
              )}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
                {subject.canAccess ? (
                  <SubjectCorrection content={subject.content} fileUrl={null} />
                ) : (
                  <Link href={`/sujets/${subject.slug}`} className="btn-secondary inline-flex">
                    {t.seeMore}
                  </Link>
                )}
              </div>
            </article>
          ))}

          {visibleSubjects.length === 0 && (
            <p className="text-center text-slate-500">{t.emptyLevel}</p>
          )}

          {user?.role === "student" && !isSubscribed && visibleSubjects.length > 0 && (
            <div className="text-center">
              <Link href="/tarifs" className="btn-primary inline-flex">
                {t.seeMore}
              </Link>
            </div>
          )}
        </div>
      )}

      {catalogueUnavailable && (
        <div className="mt-12 text-center text-slate-500">
          {t.unavailable}
        </div>
      )}

      {!catalogueUnavailable && departments.length === 0 && !(user?.role === "student" && !user.programId) && (
        <div className="mt-12 text-center text-slate-500">{t.empty}</div>
      )}
    </div>
  );
}

function scopeTree(tree: AcademicDepartment[], user: CurrentUser | null) {
  if (!user || user.role === "super_admin") return tree;
  if (user.role === "admin") {
    const ids = new Set(user.scopes.map((scope) => scope.departmentId));
    return tree.filter((department) => ids.has(department.id));
  }
  if (!user.programId) return [];
  return tree
    .map((department) => ({
      ...department,
      programs: department.programs.filter((program) => program.id === user.programId),
    }))
    .filter((department) => department.programs.length > 0);
}

function levelsFor(user: CurrentUser | null, departmentId: string | undefined): StudyLevel[] {
  if (!departmentId || !user || user.role === "super_admin") return [...STUDY_LEVELS];
  if (user.role === "student") {
    return user.level && isStudyLevel(user.level) ? [user.level] : [];
  }
  const scopes = user.scopes.filter((scope) => scope.departmentId === departmentId);
  if (scopes.some((scope) => !scope.level)) return [...STUDY_LEVELS];
  return STUDY_LEVELS.filter((level) => scopes.some((scope) => scope.level === level));
}
