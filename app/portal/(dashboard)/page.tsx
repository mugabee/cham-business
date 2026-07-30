import Link from "next/link";
import { verifyBorrowerSession } from "@/lib/borrower-dal";
import { listApplicationsForBorrower } from "@/lib/applications";
import { listLoansForBorrower } from "@/lib/loans";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

const applicationStatusTone = {
  new: "warning",
  reviewing: "neutral",
  approved: "success",
  rejected: "danger",
} as const;

const loanStatusTone = {
  active: "success",
  paid_off: "neutral",
  written_off: "danger",
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
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Welcome, {session.fullName}</h1>

      {pendingApplications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Finish your application</h2>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {pendingApplications.map((app) => (
              <Link
                key={app.id}
                href={`/portal/applications/${app.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{app.loanType} — {formatRWF(app.amountRequested)}</p>
                  <p className="text-xs text-gray-500">Submitted {formatDate(app.submittedAt)}</p>
                </div>
                <span className="text-amber-700 text-sm font-medium">Complete details →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Your loans</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Principal</th>
              <th className="px-4 py-3 font-medium">Outstanding</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{formatRWF(loan.principal)}</td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(loan.outstanding)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={loan.status} tone={loanStatusTone[loan.status]} />
                  {loan.isOverdue && <span className="ml-2"><StatusBadge label="overdue" tone="danger" /></span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/portal/loans/${loan.id}`} className="text-amber-700 hover:underline font-medium">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No loans yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Your applications</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Loan type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{app.loanType}</td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(app.amountRequested)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(app.submittedAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={app.status} tone={applicationStatusTone[app.status]} />
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
