import type { AcademicDepartment } from "@/lib/catalog";
import type { AdminScope, CurrentUser } from "@/lib/auth";
import { STUDY_LEVELS, type StudyLevel } from "@/lib/taxonomy";

export function isWholeDepartment(scope: AdminScope) {
  return Boolean(scope.departmentId) && !scope.programId && !scope.level;
}

export function scopedDepartments(tree: AcademicDepartment[], user: CurrentUser) {
  if (user.role === "super_admin") return tree;
  if (user.role !== "admin") return [];
  return tree.flatMap((department) => {
    if (user.scopes.some((scope) => isWholeDepartment(scope) && scope.departmentId === department.id)) {
      return [department];
    }
    const programs = department.programs.filter((program) =>
      user.scopes.some((scope) => scope.programId === program.id)
    );
    if (programs.length === 0) return [];
    return [{ ...department, programs }];
  });
}

export function levelsForProgram(user: CurrentUser, departmentId: string, programId: string): StudyLevel[] {
  if (user.role === "super_admin") return [...STUDY_LEVELS];
  if (user.scopes.some((scope) => isWholeDepartment(scope) && scope.departmentId === departmentId)) {
    return [...STUDY_LEVELS];
  }
  return STUDY_LEVELS.filter((level) =>
    user.scopes.some((scope) => scope.programId === programId && scope.level === level)
  );
}

export function levelsForDepartment(user: CurrentUser | null, departmentId: string | undefined, programId?: string) {
  if (!departmentId || !user || user.role === "super_admin") return [...STUDY_LEVELS];
  if (user.role === "student") {
    return user.level && (STUDY_LEVELS as readonly string[]).includes(user.level) ? [user.level as StudyLevel] : [];
  }
  if (programId) return levelsForProgram(user, departmentId, programId);
  if (user.scopes.some((scope) => isWholeDepartment(scope) && scope.departmentId === departmentId)) {
    return [...STUDY_LEVELS];
  }
  return STUDY_LEVELS.filter((level) =>
    user.scopes.some((scope) => scope.departmentId === departmentId && scope.level === level)
  );
}
