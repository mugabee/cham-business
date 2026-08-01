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
  cancelled: "neutral",
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
      <Link href="/admin/borrowers" className="text-sm text-brand hover:underline">
        ← Back to borrowers
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-ink">{borrower.fullName}</h1>
          {borrower.archivedAt && <StatusBadge label="archived" tone="neutral" />}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/borrowers/${borrower.id}/edit`}
            className="rounded-lg border border-line hover:bg-paper-deep text-ink text-sm font-medium px-4 py-2 transition-colors"
          >
            Edit
          </Link>
          {borrower.email && <EmailPortalAccessButton borrowerId={borrower.id} />}
          <Link
            href={`/admin/loans/new?borrowerId=${borrower.id}`}
            className="rounded-lg bg-brand hover:bg-brand-deep text-white text-sm font-medium px-4 py-2 transition-colors"
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

      <div className="mt-6 bg-white rounded-2xl border border-line p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-ink-soft">Phone</p>
          <p className="text-ink">{borrower.phone}</p>
        </div>
        <div>
          <p className="text-ink-soft">Email</p>
          <p className="text-ink">{borrower.email || "—"}</p>
        </div>
        <div>
          <p className="text-ink-soft">National ID</p>
          <p className="text-ink">{borrower.nationalId || "—"}</p>
        </div>
        <div>
          <p className="text-ink-soft">Monthly income</p>
          <p className="text-ink">{formatRWF(borrower.monthlyIncome)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-ink-soft">Address</p>
          <p className="text-ink">{borrower.address || "—"}</p>
        </div>
        <div className="col-span-2 text-ink-soft">Added {formatDate(borrower.createdAt)}</div>
      </div>

      <h2 className="text-lg font-semibold text-ink mt-8 mb-3">Loans</h2>
      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Loan</th>
              <th className="px-4 py-3 font-medium">Principal</th>
              <th className="px-4 py-3 font-medium">Outstanding</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {borrower.loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-paper-deep">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/loans/${loan.id}`}
                    className="font-medium text-ink hover:text-brand-deep"
                  >
                    Loan #{loan.id} ({loan.termMonths} mo)
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink">{formatRWF(loan.principal)}</td>
                <td className="px-4 py-3 text-ink">{formatRWF(loan.outstanding)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={loan.status} tone={loanStatusTone[loan.status as keyof typeof loanStatusTone]} />
                </td>
              </tr>
            ))}
            {borrower.loans.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
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
