import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listAllApplicants } from "@/lib/job-applicants";
import { APPLICANT_STATUS_LABELS, type ApplicantStatus } from "@/lib/job-types";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

const applicantTone = {
  new: "warning",
  screening: "neutral",
  interview: "neutral",
  offer: "success",
  hired: "success",
  rejected: "danger",
} as const;

export default async function AllApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await verifySession();
  const { q, status } = await searchParams;
  const applicants = await listAllApplicants({
    search: q,
    status: status as ApplicantStatus | undefined,
  });

  const exportQuery = new URLSearchParams();
  if (q) exportQuery.set("q", q);
  if (status) exportQuery.set("status", status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/jobs" className="text-sm text-brand hover:underline">
            ← Back to jobs
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-ink">All applicants</h1>
        </div>
        <a
          href={`/api/admin/job-applicants/export${exportQuery.toString() ? `?${exportQuery}` : ""}`}
          className="rounded-lg border border-line hover:bg-paper-deep text-ink text-sm font-medium px-4 py-2 transition-colors"
        >
          Export CSV
        </a>
      </div>

      <form className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or email"
          className="flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft"
        >
          <option value="">All statuses</option>
          {Object.entries(APPLICANT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brand hover:bg-brand-deep text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Applied for</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {applicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-paper-deep">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/jobs/${applicant.jobPostingId}/applicants/${applicant.id}`}
                    className="font-medium text-ink hover:text-brand-deep"
                  >
                    {applicant.fullName}
                  </Link>
                  <p className="text-ink-soft">{applicant.email}</p>
                </td>
                <td className="px-4 py-3 text-ink">{applicant.jobPostingTitle}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(applicant.submittedAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={APPLICANT_STATUS_LABELS[applicant.status]} tone={applicantTone[applicant.status]} />
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
                  No applicants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
