import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getLoanById } from "@/lib/loans";
import { listPenaltiesForLoan } from "@/lib/penalties";
import { listGuarantorsForLoan } from "@/lib/guarantors";
import { listCollateralForLoan } from "@/lib/collateral";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import ArchiveDeleteControls from "@/components/admin/ArchiveDeleteControls";
import WriteOffLoanButton from "@/components/admin/WriteOffLoanButton";
import RestructureLoanForm from "@/components/admin/RestructureLoanForm";
import CoolingOffCancelButton from "@/components/admin/CoolingOffCancelButton";
import PenaltyPanel from "@/components/admin/PenaltyPanel";
import GuarantorPanel from "@/components/admin/GuarantorPanel";
import CollateralPanel from "@/components/admin/CollateralPanel";
import KeyFactsStatement from "@/components/KeyFactsStatement";
import { deleteLoanAction } from "@/app/actions/loans";
import { deletePaymentAction } from "@/app/actions/payments";

const loanStatusTone = {
  active: "success",
  paid_off: "neutral",
  written_off: "danger",
  cancelled: "neutral",
} as const;

const COOLING_OFF_DAYS = 30;

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

  const [penalties, guarantors, collateral] = await Promise.all([
    listPenaltiesForLoan(loan.id),
    listGuarantorsForLoan(loan.id),
    listCollateralForLoan(loan.id),
  ]);

  const outstanding = loan.schedule.reduce(
    (sum, row) => sum + (row.totalDue - row.amountPaid),
    0
  );
  const totalRepayable = loan.schedule.reduce((sum, row) => sum + row.totalDue, 0);

  const coolingOffDeadline = new Date(loan.createdAt);
  coolingOffDeadline.setDate(coolingOffDeadline.getDate() + COOLING_OFF_DAYS);
  const coolingOffDaysRemaining = Math.ceil(
    (coolingOffDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const coolingOffEligible =
    loan.status === "active" && loan.payments.length === 0 && coolingOffDaysRemaining > 0;

  const unreturnedCollateral = collateral.filter((c) => !c.deregisteredAt);
  const showDeregisterReminder = loan.status === "paid_off" && unreturnedCollateral.length > 0;

  return (
    <div className="max-w-3xl">
      <Link href="/admin/loans" className="text-sm text-brand hover:underline">
        ← Back to loans
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            <Link href={`/admin/borrowers/${loan.borrowerId}`} className="hover:text-brand-deep">
              {loan.borrowerName}
            </Link>
          </h1>
          <p className="text-ink-soft text-sm mt-1">Loan #{loan.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge label={loan.status} tone={loanStatusTone[loan.status]} />
          {loan.archivedAt && <StatusBadge label="archived" tone="neutral" />}
          {loan.status === "active" && (
            <>
              <Link
                href={`/admin/payments/new?loanId=${loan.id}`}
                className="rounded-lg bg-brand hover:bg-brand-deep text-white text-sm font-medium px-4 py-2 transition-colors"
              >
                Record payment
              </Link>
              <WriteOffLoanButton loanId={loan.id} />
            </>
          )}
        </div>
      </div>

      <div className="mt-3">
        <ArchiveDeleteControls
          entity="loan"
          id={loan.id}
          archived={Boolean(loan.archivedAt)}
          confirmMessage={`Permanently delete this loan and all ${loan.payments.length} payment(s) recorded against it (totaling ${formatRWF(
            loan.payments.reduce((sum, p) => sum + p.amount, 0)
          )})? This cannot be undone.`}
          deleteAction={deleteLoanAction}
          deleteDisabled={loan.status !== "written_off"}
          deleteDisabledReason={
            loan.status !== "written_off" ? "Write off this loan first to enable deletion." : undefined
          }
        />
      </div>

      {coolingOffEligible && (
        <div className="mt-3">
          <CoolingOffCancelButton loanId={loan.id} daysRemaining={coolingOffDaysRemaining} />
        </div>
      )}

      {loan.status === "active" && (
        <RestructureLoanForm loanId={loan.id} currentRatePercent={loan.interestRateMonthly * 100} />
      )}

      <div className="mt-6 bg-white rounded-2xl border border-line p-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
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
      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
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
          <tbody className="divide-y divide-line">
            {loan.schedule.map((row) => (
              <tr key={row.id} className="hover:bg-paper-deep">
                <td className="px-4 py-2 text-ink">{row.instalmentNumber}</td>
                <td className="px-4 py-2 text-ink">{formatDate(row.dueDate)}</td>
                <td className="px-4 py-2 text-ink">{formatRWF(row.principalDue)}</td>
                <td className="px-4 py-2 text-ink">{formatRWF(row.interestDue)}</td>
                <td className="px-4 py-2 text-ink">{formatRWF(row.totalDue)}</td>
                <td className="px-4 py-2 text-ink">{formatRWF(row.amountPaid)}</td>
                <td className="px-4 py-2 flex items-center gap-2">
                  <StatusBadge label={row.status} tone={scheduleStatusTone[row.status]} />
                  {row.isOverdue && <StatusBadge label="overdue" tone="danger" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-ink mt-8 mb-3">Payment history</h2>
      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Method</th>
              <th className="px-4 py-2 font-medium">Reference</th>
              <th className="px-4 py-2 font-medium">Recorded by</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loan.payments.map((p) => (
              <tr key={p.id} className="hover:bg-paper-deep">
                <td className="px-4 py-2 text-ink">{formatDate(p.paidAt)}</td>
                <td className="px-4 py-2 text-ink">{formatRWF(p.amount)}</td>
                <td className="px-4 py-2 text-ink">{methodLabel[p.method]}</td>
                <td className="px-4 py-2 text-ink">{p.reference || "—"}</td>
                <td className="px-4 py-2 text-ink-soft">
                  {p.recordedByEmail || "—"}
                  {p.archivedAt && (
                    <span className="ml-2">
                      <StatusBadge label="archived" tone="neutral" />
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/payments/${p.id}/edit`}
                      className="text-sm font-medium text-ink-soft hover:underline"
                    >
                      Edit
                    </Link>
                    <ArchiveDeleteControls
                      entity="payment"
                      id={p.id}
                      archived={Boolean(p.archivedAt)}
                      confirmMessage={`Permanently delete this ${formatRWF(p.amount)} payment? The loan's schedule will be recalculated as if it never happened. This cannot be undone.`}
                      deleteAction={deletePaymentAction}
                      extraFields={{ loanId: loan.id }}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {loan.payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  No payments recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <KeyFactsStatement
          principal={loan.principal}
          interestRateMonthly={loan.interestRateMonthly}
          termMonths={loan.termMonths}
          totalRepayable={totalRepayable}
        />
      </div>

      <div className="mt-6 space-y-6">
        <PenaltyPanel loanId={loan.id} penalties={penalties} />
        <GuarantorPanel loanId={loan.id} guarantors={guarantors} />
        <CollateralPanel
          loanId={loan.id}
          collateral={collateral}
          showDeregisterReminder={showDeregisterReminder}
        />
      </div>
    </div>
  );
}
