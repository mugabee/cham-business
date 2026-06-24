import { verifySession } from "@/lib/dal";

export default async function AdminDashboard() {
  await verifySession();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
      <p className="text-gray-500">
        Welcome to Cham Business admin. Use the sidebar to navigate.
      </p>
    </div>
  );
}
