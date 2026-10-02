import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function canAccessExam(examId: string, userId: string | null) {
  if (!userId) return false;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("can_access_exam", { target: examId });
  if (error) return false;
  return Boolean(data);
}
