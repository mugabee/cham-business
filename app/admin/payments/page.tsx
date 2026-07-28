import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listPayments } from "@/lib/payments";
import { formatRWF, formatDate } from "@/lib/format";

const methodLabel = { mtn: "MTN Mobile Money", airtel: "Airtel Money", bank: "Bank transfer" } as const;

export default async function PaymentsPage() {
  await verifySession();
  const payments = await listPayments({});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
        <Link
          href="/admin/payments/new"
          className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Record payment
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Borrower</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Recorded by</th>
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
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
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
