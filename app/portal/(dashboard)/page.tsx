import Link from "next/link";
import { verifyBorrowerSession } from "@/lib/borrower-dal";
import { listApplicationsForBorrower } from "@/lib/applications";
import { listLoansForBorrower } from "@/lib/loans";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import LoanProgressCard from "@/components/portal/LoanProgressCard";

export const dynamic = "force-dynamic";

const applicationStatusTone = {
  new: "warning",
  reviewing: "neutral",
  approved: "success",
  rejected: "danger",
} as const;

export default async function PortalDashboardPage() {
  const session = await verifyBorrowerSession();
  const [applications, loans] = await Promise.all([
    listApplicationsForBorrower(session.borrowerId),
    listLoansForBorrower(session.borrowerId),
  ]);

  const pendingApplications = applications.filter(
    (a) => a.status === "approved" && !a.detailsCompleted
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">Welcome, {session.fullName}</h1>
      <p className="text-ink-soft mb-6">Here&apos;s where things stand with your loan.</p>

      {pendingApplications.length > 0 && (
        <div className="mb-8 rounded-2xl border-2 border-accent bg-white p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-accent-deep mb-1">Next step: finish your application</p>
            <p className="text-sm text-ink-soft">
              {pendingApplications[0].loanType} — {formatRWF(pendingApplications[0].amountRequested)}. A few
              more details and your documents, then you&apos;re all set.
            </p>
          </div>
          <Link
            href={`/portal/applications/${pendingApplications[0].id}`}
            className="shrink-0 rounded-full bg-accent-deep hover:bg-accent-deep/90 text-white text-sm font-medium px-5 py-2.5 transition-colors"
          >
            Complete now
          </Link>
        </div>
      )}

      <h2 className="text-lg font-semibold text-ink mb-3">Your loans</h2>
      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-line p-8 text-center text-ink-soft mb-8">
          No loans yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          {loans.map((loan) => (
            <LoanProgressCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold text-ink mb-3">Your applications</h2>
      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-deep text-left text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">Loan type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Submitted</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="px-4 py-3 text-ink">{app.loanType}</td>
                  <td className="px-4 py-3 text-ink">{formatRWF(app.amountRequested)}</td>
                  <td className="px-4 py-3 text-ink-soft hidden sm:table-cell">{formatDate(app.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={app.status} tone={applicationStatusTone[app.status]} />
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
