import { verifySession } from "@/lib/dal";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar email={session.email ?? ""} />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
