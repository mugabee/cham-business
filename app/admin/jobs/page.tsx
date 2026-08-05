import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listJobPostings, EMPLOYMENT_TYPE_LABELS, type JobPostingStatus } from "@/lib/jobs";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

const statusTone = {
  draft: "neutral",
  open: "success",
  closed: "warning",
} as const;

const tabs: { label: string; value: JobPostingStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await verifySession();
  const { status } = await searchParams;
  const postings = await listJobPostings({ status: status as JobPostingStatus | undefined });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Jobs</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs/applicants"
            className="rounded-lg border border-line hover:bg-paper-deep text-ink text-sm font-medium px-4 py-2 transition-colors"
          >
            All applicants
          </Link>
          <Link
            href="/admin/jobs/new"
            className="rounded-lg bg-brand hover:bg-brand-deep text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            New posting
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mb-1 mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/jobs?status=${tab.value}` : "/admin/jobs"}
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

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Applicants</th>
              <th className="px-4 py-3 font-medium">Posted</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {postings.map((posting) => (
              <tr key={posting.id} className="hover:bg-paper-deep">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/jobs/${posting.id}`}
                    className="font-medium text-ink hover:text-brand-deep"
                  >
                    {posting.title}
                  </Link>
                  {posting.department && <p className="text-ink-soft">{posting.department}</p>}
                </td>
                <td className="px-4 py-3 text-ink">{EMPLOYMENT_TYPE_LABELS[posting.employmentType]}</td>
                <td className="px-4 py-3 text-ink">{posting.location}</td>
                <td className="px-4 py-3 text-ink">{posting.applicantCount}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(posting.createdAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={posting.status} tone={statusTone[posting.status]} />
                </td>
              </tr>
            ))}
            {postings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  No job postings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
