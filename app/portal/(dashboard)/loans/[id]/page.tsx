import { notFound } from "next/navigation";
import Link from "next/link";
import { verifyBorrowerSession } from "@/lib/borrower-dal";
import { getLoanForBorrower } from "@/lib/loans";
import { listPaymentProofsForLoan } from "@/lib/payment-proofs";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import PaymentProofForm from "@/components/portal/PaymentProofForm";
import KeyFactsStatement from "@/components/KeyFactsStatement";

export const dynamic = "force-dynamic";

const loanStatusTone = {
  active: "success",
  paid_off: "neutral",
  written_off: "danger",
  cancelled: "neutral",
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
  const totalRepayable = loan.schedule.reduce((sum, row) => sum + row.totalDue, 0);

  return (
    <div>
      <Link href="/portal" className="text-sm text-brand hover:underline">
        ← Back
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Loan #{loan.id}</h1>
        <StatusBadge label={loan.status} tone={loanStatusTone[loan.status]} />
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-line p-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-ink-soft">Principal</p>
          <p className="text-ink font-medium">{formatRWF(loan.principal)}</p>
        </div>
        <div>
          <p className="text-ink-soft">Term</p>
          <p className="text-ink font-medium">{loan.termMonths} months</p>
        </div>
        <div>
          <p className="text-ink-soft">Rate</p>
          <p className="text-ink font-medium">{(loan.interestRateMonthly * 100).toFixed(2)}% / month</p>
        </div>
        <div>
          <p className="text-ink-soft">Outstanding</p>
          <p className="text-ink font-medium">{formatRWF(outstanding)}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-ink mt-8 mb-3">Repayment schedule</h2>
      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-deep text-left text-ink-soft">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Due date</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Paid</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loan.schedule.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2 text-ink">{row.instalmentNumber}</td>
                  <td className="px-4 py-2 text-ink whitespace-nowrap">{formatDate(row.dueDate)}</td>
                  <td className="px-4 py-2 text-ink whitespace-nowrap">{formatRWF(row.totalDue)}</td>
                  <td className="px-4 py-2 text-ink whitespace-nowrap">{formatRWF(row.amountPaid)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge label={row.status} tone={scheduleStatusTone[row.status]} />
                      {row.isOverdue && <StatusBadge label="overdue" tone="danger" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-ink mt-8 mb-3">Payment history</h2>
      <div className="bg-white rounded-2xl border border-line overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-deep text-left text-ink-soft">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loan.payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 text-ink whitespace-nowrap">{formatDate(p.paidAt)}</td>
                  <td className="px-4 py-2 text-ink whitespace-nowrap">{formatRWF(p.amount)}</td>
                  <td className="px-4 py-2 text-ink">{methodLabel[p.method]}</td>
                </tr>
              ))}
              {loan.payments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-ink-soft">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {proofs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-3">Your submitted payment proofs</h2>
          <div className="bg-white rounded-2xl border border-line divide-y divide-line">
            {proofs.map((proof) => (
              <div key={proof.id} className="px-5 py-3 flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="text-ink truncate">
                    {formatRWF(proof.amountClaimed)} via {methodLabel[proof.method]}
                  </p>
                  <p className="text-ink-soft text-xs">{formatDate(proof.createdAt)}</p>
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

      <div className="mt-8">
        <KeyFactsStatement
          principal={loan.principal}
          interestRateMonthly={loan.interestRateMonthly}
          termMonths={loan.termMonths}
          totalRepayable={totalRepayable}
        />
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        Not happy with something about this loan?{" "}
        <Link href={`/portal/complaints?loanId=${loan.id}`} className="text-brand hover:underline">
          File a complaint
        </Link>
      </p>
    </div>
  );
}
