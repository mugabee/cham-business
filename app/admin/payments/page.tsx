import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listPayments } from "@/lib/payments";
import { formatRWF, formatDate } from "@/lib/format";
import ArchiveDeleteControls from "@/components/admin/ArchiveDeleteControls";
import { deletePaymentAction } from "@/app/actions/payments";

const methodLabel = { mtn: "MTN Mobile Money", airtel: "Airtel Money", bank: "Bank transfer" } as const;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  await verifySession();
  const { archived } = await searchParams;
  const isArchived = archived === "1";
  const payments = await listPayments({ archived: isArchived });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Payments {isArchived && <span className="text-base font-normal text-gray-400">— Archived</span>}
        </h1>
        <Link
          href="/admin/payments/new"
          className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Record payment
        </Link>
      </div>

      <div className="flex justify-end mb-4">
        <Link
          href={isArchived ? "/admin/payments" : "/admin/payments?archived=1"}
          className="rounded-full px-3 py-1.5 text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          {isArchived ? "← Back to active" : "Archived"}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Borrower</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Recorded by</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{formatDate(p.paidAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/loans/${p.loanId}`}
                    className="font-medium text-gray-900 hover:text-amber-700"
                  >
                    {p.borrowerName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(p.amount)}</td>
                <td className="px-4 py-3 text-gray-700">{methodLabel[p.method]}</td>
                <td className="px-4 py-3 text-gray-700">{p.reference || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p.recordedByEmail || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/payments/${p.id}/edit`}
                      className="text-sm font-medium text-gray-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <ArchiveDeleteControls
                      entity="payment"
                      id={p.id}
                      archived={Boolean(p.archivedAt)}
                      confirmMessage={`Permanently delete this ${formatRWF(p.amount)} payment? The loan's schedule will be recalculated as if it never happened. This cannot be undone.`}
                      deleteAction={deletePaymentAction}
                      extraFields={{ loanId: p.loanId }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
