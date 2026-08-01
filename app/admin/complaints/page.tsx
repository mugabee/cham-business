import { verifySession } from "@/lib/dal";
import { listComplaints } from "@/lib/complaints";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import ComplaintStatusControls from "@/components/admin/ComplaintStatusControls";
import Link from "next/link";

const statusTone = {
  open: "warning",
  investigating: "neutral",
  resolved: "success",
  rejected: "danger",
} as const;

const tabs = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "Investigating", value: "investigating" },
  { label: "Resolved", value: "resolved" },
  { label: "Rejected", value: "rejected" },
];

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await verifySession();
  const { status } = await searchParams;
  const complaints = await listComplaints({ status });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-6">Complaints</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/complaints?status=${tab.value}` : "/admin/complaints"}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              (status ?? "") === tab.value
                ? "bg-brand text-white"
                : "bg-white text-ink-soft border border-line hover:bg-paper-deep"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-line divide-y divide-line">
        {complaints.map((c) => (
          <div key={c.id} className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-medium text-ink">
                  {c.category}
                  {c.borrowerName ? ` — ${c.borrowerName}` : ""}
                </p>
                <p className="text-xs text-ink-soft">
                  {formatDate(c.submittedAt)} · via {c.channel}
                  {c.loanId && (
                    <>
                      {" · "}
                      <Link href={`/admin/loans/${c.loanId}`} className="text-brand hover:underline">
                        Loan #{c.loanId}
                      </Link>
                    </>
                  )}
                </p>
              </div>
              <StatusBadge label={c.status} tone={statusTone[c.status]} />
            </div>
            <p className="text-sm text-ink mb-3">{c.description}</p>
            {c.resolutionNotes && (
              <p className="text-sm text-ink-soft mb-3">
                <span className="font-medium">Resolution: </span>
                {c.resolutionNotes}
              </p>
            )}
            <ComplaintStatusControls complaintId={c.id} currentStatus={c.status} />
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="p-8 text-center text-ink-soft">No complaints found.</div>
        )}
      </div>
    </div>
  );
}
