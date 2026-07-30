import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyBorrowerSession } from "@/lib/borrower-dal";
import { getLoanForBorrower } from "@/lib/loans";
import { listPaymentProofsForLoan } from "@/lib/payment-proofs";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import PaymentProofForm from "@/components/portal/PaymentProofForm";

export const dynamic = "force-dynamic";

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

const proofStatusTone = {
  pending: "warning",
  confirmed: "success",
  rejected: "danger",
} as const;

const methodLabel = { mtn: "MTN Mobile Money", airtel: "Airtel Money", bank: "Bank transfer" } as const;

export default async function PortalLoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifyBorrowerSession();
  const { id } = await params;
  const loan = await getLoanForBorrower(Number(id), session.borrowerId);

  if (!loan) notFound();

  const proofs = await listPaymentProofsForLoan(loan.id);
  const outstanding = loan.schedule.reduce((sum, row) => sum + (row.totalDue - row.amountPaid), 0);

  return (
    <div>
      <Link href="/portal" className="text-sm text-amber-700 hover:underline">
        ← Back
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Loan #{loan.id}</h1>
        <StatusBadge label={loan.status} tone={loanStatusTone[loan.status]} />
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
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
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Paid</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loan.schedule.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-2 text-gray-700">{row.instalmentNumber}</td>
                <td className="px-4 py-2 text-gray-700">{formatDate(row.dueDate)}</td>
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
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loan.payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 text-gray-700">{formatDate(p.paidAt)}</td>
                <td className="px-4 py-2 text-gray-700">{formatRWF(p.amount)}</td>
                <td className="px-4 py-2 text-gray-700">{methodLabel[p.method]}</td>
              </tr>
            ))}
            {loan.payments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {proofs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Your submitted payment proofs</h2>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {proofs.map((proof) => (
              <div key={proof.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-900">{formatRWF(proof.amountClaimed)} via {methodLabel[proof.method]}</p>
                  <p className="text-gray-500 text-xs">{formatDate(proof.createdAt)}</p>
                  {proof.status === "rejected" && proof.staffNote && (
                    <p className="text-red-600 text-xs mt-1">Note: {proof.staffNote}</p>
                  )}
                </div>
                <StatusBadge label={proof.status} tone={proofStatusTone[proof.status]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {loan.status === "active" && <PaymentProofForm loanId={loan.id} />}
    </div>
  );
}
