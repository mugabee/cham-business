import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listBorrowers } from "@/lib/borrowers";
import { formatDate } from "@/lib/format";

export default async function BorrowersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string }>;
}) {
  await verifySession();
  const { q, archived } = await searchParams;
  const isArchived = archived === "1";
  const borrowers = await listBorrowers({ search: q, archived: isArchived });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">
          Borrowers {isArchived && <span className="text-base font-normal text-ink-soft">— Archived</span>}
        </h1>
        <Link
          href="/admin/borrowers/new"
          className="rounded-lg bg-brand hover:bg-brand-deep text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Add borrower
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <form className="w-full sm:max-w-sm">
          {isArchived && <input type="hidden" name="archived" value="1" />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or phone…"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft"
          />
        </form>
        <Link
          href={isArchived ? "/admin/borrowers" : "/admin/borrowers?archived=1"}
          className="shrink-0 self-start rounded-full px-3 py-1.5 text-sm font-medium border border-dashed border-line text-ink-soft hover:bg-paper-deep"
        >
          {isArchived ? "← Back to active" : "Archived"}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {borrowers.map((b) => (
              <tr key={b.id} className="hover:bg-paper-deep">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/borrowers/${b.id}`}
                    className="font-medium text-ink hover:text-brand-deep"
                  >
                    {b.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink">{b.phone}</td>
                <td className="px-4 py-3 text-ink">{b.email || "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(b.createdAt)}</td>
              </tr>
            ))}
            {borrowers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
                  No borrowers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
