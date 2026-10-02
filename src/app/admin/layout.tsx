import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) redirect("/");

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <AdminSidebar role={user.role} name={user.name} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
