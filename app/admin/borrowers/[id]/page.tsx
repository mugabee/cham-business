import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getBorrowerById } from "@/lib/borrowers";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import ArchiveDeleteControls from "@/components/admin/ArchiveDeleteControls";
import EmailPortalAccessButton from "@/components/admin/EmailPortalAccessButton";
import { deleteBorrowerAction } from "@/app/actions/borrowers";

const loanStatusTone = {
  active: "success",
  paid_off: "neutral",
  written_off: "danger",
} as const;

export default async function BorrowerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const borrower = await getBorrowerById(Number(id));

  if (!borrower) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/borrowers" className="text-sm text-amber-700 hover:underline">
        ← Back to borrowers
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">{borrower.fullName}</h1>
          {borrower.archivedAt && <StatusBadge label="archived" tone="neutral" />}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/borrowers/${borrower.id}/edit`}
            className="rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 transition-colors"
          >
            Edit
          </Link>
          {borrower.email && <EmailPortalAccessButton borrowerId={borrower.id} />}
          <Link
            href={`/admin/loans/new?borrowerId=${borrower.id}`}
            className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            + New loan
          </Link>
        </div>
      </div>

      <div className="mt-3">
        <ArchiveDeleteControls
          entity="borrower"
          id={borrower.id}
          archived={Boolean(borrower.archivedAt)}
          confirmMessage={`Permanently delete ${borrower.fullName}? This cannot be undone.`}
          deleteAction={deleteBorrowerAction}
          deleteDisabled={borrower.loans.length > 0}
          deleteDisabledReason={
            borrower.loans.length > 0
              ? `Has ${borrower.loans.length} loan(s) -- delete those first.`
              : undefined
          }
        />
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Phone</p>
          <p className="text-gray-900">{borrower.phone}</p>
        </div>
        <div>
          <p className="text-gray-500">Email</p>
          <p className="text-gray-900">{borrower.email || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">National ID</p>
          <p className="text-gray-900">{borrower.nationalId || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Monthly income</p>
          <p className="text-gray-900">{formatRWF(borrower.monthlyIncome)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500">Address</p>
          <p className="text-gray-900">{borrower.address || "—"}</p>
        </div>
        <div className="col-span-2 text-gray-500">Added {formatDate(borrower.createdAt)}</div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Loans</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Loan</th>
              <th className="px-4 py-3 font-medium">Principal</th>
              <th className="px-4 py-3 font-medium">Outstanding</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {borrower.loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/loans/${loan.id}`}
                    className="font-medium text-gray-900 hover:text-amber-700"
                  >
                    Loan #{loan.id} ({loan.termMonths} mo)
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(loan.principal)}</td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(loan.outstanding)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={loan.status} tone={loanStatusTone[loan.status as keyof typeof loanStatusTone]} />
                </td>
              </tr>
            ))}
            {borrower.loans.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No loans yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
