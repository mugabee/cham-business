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
      <h1 className="text-2xl font-semibold text-ink mb-6">Audit log</h1>

      <div className="flex gap-2 mb-4">
        {entities.map((e) => (
          <Link
            key={e}
            href={e ? `/admin/audit?entity=${e}` : "/admin/audit"}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              (entity ?? "") === e
                ? "bg-brand text-white"
                : "bg-white text-ink-soft border border-line hover:bg-paper-deep"
            }`}
          >
            {e || "All"}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Staff</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-paper-deep">
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  {formatDate(entry.createdAt)}
                </td>
                <td className="px-4 py-3 text-ink">{entry.staffEmail || "—"}</td>
                <td className="px-4 py-3 text-ink font-medium">{entry.action}</td>
                <td className="px-4 py-3 text-ink">
                  {entry.entity} #{entry.entityId}
                </td>
                <td className="px-4 py-3 text-ink-soft font-mono text-xs">
                  {entry.detail ? JSON.stringify(entry.detail) : "—"}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
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
