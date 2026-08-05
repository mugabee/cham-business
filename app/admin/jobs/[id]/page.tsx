import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getJobPostingById, EMPLOYMENT_TYPE_LABELS } from "@/lib/jobs";
import { listApplicantsForPosting, APPLICANT_STATUS_LABELS } from "@/lib/job-applicants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import JobPostingActions from "@/components/admin/JobPostingActions";

const statusTone = {
  draft: "neutral",
  open: "success",
  closed: "warning",
} as const;

const applicantTone = {
  new: "warning",
  screening: "neutral",
  interview: "neutral",
  offer: "success",
  hired: "success",
  rejected: "danger",
} as const;

export default async function JobPostingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const posting = await getJobPostingById(Number(id));
  if (!posting) notFound();

  const applicants = await listApplicantsForPosting(posting.id);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/jobs" className="text-sm text-brand hover:underline">
        ← Back to jobs
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{posting.title}</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/jobs/${posting.id}/edit`}
            className="rounded-lg border border-line hover:bg-paper-deep text-ink text-sm font-medium px-4 py-2 transition-colors"
          >
            Edit
          </Link>
          <StatusBadge label={posting.status} tone={statusTone[posting.status]} />
        </div>
      </div>

      <div className="mt-3">
        <JobPostingActions id={posting.id} status={posting.status} applicantCount={applicants.length} />
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-line p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-ink-soft">Department</p>
          <p className="text-ink">{posting.department || "—"}</p>
        </div>
        <div>
          <p className="text-ink-soft">Employment type</p>
          <p className="text-ink">{EMPLOYMENT_TYPE_LABELS[posting.employmentType]}</p>
        </div>
        <div>
          <p className="text-ink-soft">Location</p>
          <p className="text-ink">{posting.location}</p>
        </div>
        <div>
          <p className="text-ink-soft">Posted</p>
          <p className="text-ink">{formatDate(posting.createdAt)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-ink-soft">Summary</p>
          <p className="text-ink">{posting.summary}</p>
        </div>
        <div className="col-span-2">
          <p className="text-ink-soft">Description</p>
          <p className="text-ink whitespace-pre-wrap">{posting.description}</p>
        </div>
        <div className="col-span-2">
          <p className="text-ink-soft">Requirements</p>
          <p className="text-ink whitespace-pre-wrap">{posting.requirements}</p>
        </div>
        {posting.status === "open" && (
          <div className="col-span-2">
            <p className="text-ink-soft">Public link</p>
            <a
              href={`/careers/${posting.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              chambusiness.org/careers/{posting.slug} →
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-line overflow-x-auto">
        <div className="px-5 py-4 border-b border-line">
          <h2 className="font-semibold text-ink">Applicants ({applicants.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {applicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-paper-deep">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/jobs/${posting.id}/applicants/${applicant.id}`}
                    className="font-medium text-ink hover:text-brand-deep"
                  >
                    {applicant.fullName}
                  </Link>
                  <p className="text-ink-soft">{applicant.email}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(applicant.submittedAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={APPLICANT_STATUS_LABELS[applicant.status]} tone={applicantTone[applicant.status]} />
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-ink-soft">
                  No applicants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
