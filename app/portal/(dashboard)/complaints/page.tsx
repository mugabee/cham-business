import { verifyBorrowerSession } from "@/lib/borrower-dal";
import { listComplaintsForBorrower } from "@/lib/complaints";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import ComplaintForm from "@/components/portal/ComplaintForm";

export const dynamic = "force-dynamic";

const statusTone = {
  open: "warning",
  investigating: "neutral",
  resolved: "success",
  rejected: "danger",
} as const;

export default async function PortalComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ loanId?: string }>;
}) {
  const session = await verifyBorrowerSession();
  const { loanId } = await searchParams;
  const complaints = await listComplaintsForBorrower(session.borrowerId);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">Complaints</h1>
      <p className="text-ink-soft mb-6">
        Tell us if something about your loan or our service wasn&apos;t right — we review every complaint.
      </p>

      <ComplaintForm loanId={loanId ? Number(loanId) : undefined} />

      {complaints.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-ink mb-3">Your complaints</h2>
          <div className="bg-white rounded-2xl border border-line divide-y divide-line">
            {complaints.map((c) => (
              <div key={c.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="font-medium text-ink text-sm">{c.category}</p>
                  <StatusBadge label={c.status} tone={statusTone[c.status]} />
                </div>
                <p className="text-xs text-ink-soft mb-2">{formatDate(c.submittedAt)}</p>
                <p className="text-sm text-ink">{c.description}</p>
                {c.resolutionNotes && (
                  <p className="text-sm text-ink-soft mt-2">
                    <span className="font-medium">Our response: </span>
                    {c.resolutionNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
