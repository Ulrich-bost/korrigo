import { AuthShell } from "@/components/AuthShell";
import { getAcademicTree } from "@/lib/catalog";
import { rethrowNavigationError } from "@/lib/navigation-error";
import { RegisterForm } from "./RegisterForm";

export default async function RegisterPage() {
  let tree: Awaited<ReturnType<typeof getAcademicTree>> = [];
  try {
    tree = await getAcademicTree();
  } catch (error) {
    rethrowNavigationError(error);
  }

  return (
    <AuthShell>
      <RegisterForm tree={tree} />
    </AuthShell>
  );
}
