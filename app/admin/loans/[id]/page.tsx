import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getLoanById } from "@/lib/loans";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

const loanStatusTone = {
  active: "success",
  paid_off: "neutral",
  written_off: "danger",
} as const;

const scheduleStatusTone = {
  pending: "neutral",
  partial: "warning",
  paid: "success",
} as const;

const methodLabel = { mtn: "MTN Mobile Money", airtel: "Airtel Money", bank: "Bank transfer" } as const;

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const loan = await getLoanById(Number(id));

  if (!loan) notFound();

  const outstanding = loan.schedule.reduce(
    (sum, row) => sum + (row.totalDue - row.amountPaid),
    0
  );

  return (
    <div className="max-w-3xl">
      <Link href="/admin/loans" className="text-sm text-amber-700 hover:underline">
        ← Back to loans
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            <Link href={`/admin/borrowers/${loan.borrowerId}`} className="hover:text-amber-700">
              {loan.borrowerName}
            </Link>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Loan #{loan.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge label={loan.status} tone={loanStatusTone[loan.status]} />
          {loan.status === "active" && (
            <Link
              href={`/admin/payments/new?loanId=${loan.id}`}
              className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              Record payment
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-gray-500">Principal</p>
          <p className="text-gray-900 font-medium">{formatRWF(loan.principal)}</p>
        </div>
        <div>
          <p className="text-gray-500">Term</p>
          <p className="text-gray-900 font-medium">{loan.termMonths} months</p>
        </div>
        <div>
          <p className="text-gray-500">Rate</p>
          <p className="text-gray-900 font-medium">{(loan.interestRateMonthly * 100).toFixed(2)}% / month</p>
        </div>
        <div>
          <p className="text-gray-500">Outstanding</p>
          <p className="text-gray-900 font-medium">{formatRWF(outstanding)}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Repayment schedule</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Due date</th>
              <th className="px-4 py-2 font-medium">Principal</th>
              <th className="px-4 py-2 font-medium">Interest</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Paid</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loan.schedule.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{row.instalmentNumber}</td>
                <td className="px-4 py-2 text-gray-700">{formatDate(row.dueDate)}</td>
                <td className="px-4 py-2 text-gray-700">{formatRWF(row.principalDue)}</td>
                <td className="px-4 py-2 text-gray-700">{formatRWF(row.interestDue)}</td>
                <td className="px-4 py-2 text-gray-700">{formatRWF(row.totalDue)}</td>
                <td className="px-4 py-2 text-gray-700">{formatRWF(row.amountPaid)}</td>
                <td className="px-4 py-2 flex items-center gap-2">
                  <StatusBadge label={row.status} tone={scheduleStatusTone[row.status]} />
                  {row.isOverdue && <StatusBadge label="overdue" tone="danger" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Payment history</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Method</th>
              <th className="px-4 py-2 font-medium">Reference</th>
              <th className="px-4 py-2 font-medium">Recorded by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loan.payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-700">{formatDate(p.paidAt)}</td>
                <td className="px-4 py-2 text-gray-700">{formatRWF(p.amount)}</td>
                <td className="px-4 py-2 text-gray-700">{methodLabel[p.method]}</td>
                <td className="px-4 py-2 text-gray-700">{p.reference || "—"}</td>
                <td className="px-4 py-2 text-gray-500">{p.recordedByEmail || "—"}</td>
              </tr>
            ))}
            {loan.payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
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
