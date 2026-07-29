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
        <h1 className="text-2xl font-semibold text-gray-900">
          Borrowers {isArchived && <span className="text-base font-normal text-gray-400">— Archived</span>}
        </h1>
        <Link
          href="/admin/borrowers/new"
          className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Add borrower
        </Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <form>
          {isArchived && <input type="hidden" name="archived" value="1" />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or phone…"
            className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </form>
        <Link
          href={isArchived ? "/admin/borrowers" : "/admin/borrowers?archived=1"}
          className="rounded-full px-3 py-1.5 text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          {isArchived ? "← Back to active" : "Archived"}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {borrowers.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/borrowers/${b.id}`}
                    className="font-medium text-gray-900 hover:text-amber-700"
                  >
                    {b.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{b.phone}</td>
                <td className="px-4 py-3 text-gray-700">{b.email || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(b.createdAt)}</td>
              </tr>
            ))}
            {borrowers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
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
