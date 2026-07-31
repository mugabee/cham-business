import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listApplications } from "@/lib/applications";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

const statusTone = {
  new: "warning",
  reviewing: "neutral",
  approved: "success",
  rejected: "danger",
} as const;

const tabs = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; archived?: string }>;
}) {
  await verifySession();
  const { status, archived } = await searchParams;
  const isArchived = archived === "1";
  const applications = await listApplications({ status, archived: isArchived });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">
          Applications {isArchived && <span className="text-base font-normal text-ink-soft">— Archived</span>}
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={
                (tab.value ? `/admin/applications?status=${tab.value}` : "/admin/applications") +
                (isArchived ? (tab.value ? "&archived=1" : "?archived=1") : "")
              }
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
        <Link
          href={
            isArchived
              ? status
                ? `/admin/applications?status=${status}`
                : "/admin/applications"
              : status
                ? `/admin/applications?status=${status}&archived=1`
                : "/admin/applications?archived=1"
          }
          className="shrink-0 self-start rounded-full px-3 py-1.5 text-sm font-medium border border-dashed border-line text-ink-soft hover:bg-paper-deep"
        >
          {isArchived ? "← Back to active" : "Archived"}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Loan type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-paper-deep">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="font-medium text-ink hover:text-brand-deep"
                  >
                    {app.fullName}
                  </Link>
                  <p className="text-ink-soft">{app.phone}</p>
                </td>
                <td className="px-4 py-3 text-ink">{app.loanType}</td>
                <td className="px-4 py-3 text-ink">{formatRWF(app.amountRequested)}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(app.submittedAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={app.status} tone={statusTone[app.status]} />
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
