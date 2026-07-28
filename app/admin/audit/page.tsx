import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listAuditLog } from "@/lib/audit";
import { formatDate } from "@/lib/format";

const entities = ["", "application", "borrower", "loan", "payment"];

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  await verifySession();
  const { entity } = await searchParams;
  const entries = await listAuditLog({ entity });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Audit log</h1>

      <div className="flex gap-2 mb-4">
        {entities.map((e) => (
          <Link
            key={e}
            href={e ? `/admin/audit?entity=${e}` : "/admin/audit"}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              (entity ?? "") === e
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {e || "All"}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Staff</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {formatDate(entry.createdAt)}
                </td>
                <td className="px-4 py-3 text-gray-700">{entry.staffEmail || "—"}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{entry.action}</td>
                <td className="px-4 py-3 text-gray-700">
                  {entry.entity} #{entry.entityId}
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                  {entry.detail ? JSON.stringify(entry.detail) : "—"}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
