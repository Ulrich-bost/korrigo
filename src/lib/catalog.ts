import { unstable_cache } from "next/cache";
import { createSupabasePublicClient, createSupabaseServerClient } from "@/lib/supabase/server";

export interface AcademicProgram {
  id: string;
  name: string;
  slug: string;
}

export interface AcademicDepartment {
  id: string;
  name: string;
  slug: string;
  programs: AcademicProgram[];
}

export interface CatalogExam {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  department: string;
  faculty: string;
  programId: string;
  level: string;
  year: number;
  semester: string | null;
  examType: string;
  isFree: boolean;
  filePath: string | null;
  views: number;
  createdAt: string;
}

interface ExamRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  program_id: string;
  level: string;
  year: number;
  semester: string | null;
  exam_type: string;
  is_free: boolean;
  file_path: string | null;
  views: number;
  created_at: string;
  programs: { name: string; departments: { name: string } | { name: string }[] | null } | { name: string; departments: { name: string } | { name: string }[] | null }[] | null;
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapExam(row: ExamRow): CatalogExam {
  const program = one(row.programs);
  const department = one(program?.departments ?? null);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    department: department?.name ?? "",
    faculty: program?.name ?? "",
    programId: row.program_id,
    level: row.level,
    year: row.year,
    semester: row.semester,
    examType: row.exam_type,
    isFree: row.is_free,
    filePath: row.file_path,
    views: row.views,
    createdAt: row.created_at,
  };
}

export const getAcademicTree = unstable_cache(
  async (): Promise<AcademicDepartment[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("departments")
      .select("id, name, slug, programs(id, name, slug)")
      .order("name");
    if (error) throw error;
    return (data ?? []).map((department) => ({
      id: department.id,
      name: department.name,
      slug: department.slug,
      programs: ((department.programs ?? []) as AcademicProgram[]).sort((a, b) =>
        a.name.localeCompare(b.name, "fr")
      ),
    }));
  },
  ["academic-tree"],
  { revalidate: 3600 }
);

export const getExamCatalog = unstable_cache(
  async (): Promise<CatalogExam[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("exams")
      .select(
        "id, title, slug, description, program_id, level, year, semester, exam_type, is_free, file_path, views, created_at, programs(name, departments(name))"
      )
      .order("title");
    if (error) throw error;
    return ((data ?? []) as ExamRow[]).map(mapExam);
  },
  ["exam-catalog"],
  { revalidate: 3600 }
);

export async function getExamBySlug(slug: string) {
  const exams = await getExamCatalog();
  return exams.find((exam) => exam.slug === slug) ?? null;
}

export async function getCorrection(examId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("corrections")
    .select("body, file_path")
    .eq("exam_id", examId)
    .maybeSingle();
  return data;
}

export async function signedFileUrl(path: string | null) {
  if (!path) return null;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.storage.from("exams").createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
