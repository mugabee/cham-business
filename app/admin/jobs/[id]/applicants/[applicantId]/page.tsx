import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getJobApplicantById, getApplicantStatusHistory, APPLICANT_STATUS_LABELS } from "@/lib/job-applicants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import ApplicantPipelineControl from "@/components/admin/ApplicantPipelineControl";
import ApplicantStatusHistory from "@/components/admin/ApplicantStatusHistory";
import ApplicantRatingControl from "@/components/admin/ApplicantRatingControl";
import ApplicantWhatsAppButton from "@/components/admin/ApplicantWhatsAppButton";
import VideoInterviewRequestButton from "@/components/admin/VideoInterviewRequestButton";

const applicantTone = {
  new: "warning",
  screening: "neutral",
  interview: "neutral",
  offer: "success",
  hired: "success",
  rejected: "danger",
} as const;

export default async function JobApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string; applicantId: string }>;
}) {
  await verifySession();
  const { id, applicantId } = await params;
  const applicant = await getJobApplicantById(Number(applicantId));
  if (!applicant || applicant.jobPostingId !== Number(id)) notFound();
  const history = await getApplicantStatusHistory(applicant.id);

  return (
    <div className="max-w-2xl">
      <Link href={`/admin/jobs/${id}`} className="text-sm text-brand hover:underline">
        ← Back to {applicant.jobPostingTitle}
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{applicant.fullName}</h1>
        <StatusBadge label={APPLICANT_STATUS_LABELS[applicant.status]} tone={applicantTone[applicant.status]} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-ink-soft">Applied for {applicant.jobPostingTitle}</p>
        <ApplicantRatingControl
          applicantId={applicant.id}
          jobPostingId={applicant.jobPostingId}
          currentRating={applicant.rating}
        />
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-line p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-ink-soft">Email</p>
          <p className="text-ink">{applicant.email}</p>
        </div>
        <div>
          <p className="text-ink-soft">Phone</p>
          <p className="text-ink">{applicant.phone}</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <ApplicantWhatsAppButton
              phone={applicant.phone}
              fullName={applicant.fullName}
              jobPostingTitle={applicant.jobPostingTitle}
              status={applicant.status}
            />
            {applicant.status === "interview" && (
              <VideoInterviewRequestButton
                phone={applicant.phone}
                fullName={applicant.fullName}
                jobPostingTitle={applicant.jobPostingTitle}
              />
            )}
          </div>
        </div>
        <div>
          <p className="text-ink-soft">Submitted</p>
          <p className="text-ink">{formatDate(applicant.submittedAt)}</p>
        </div>
        <div>
          <p className="text-ink-soft">Resume</p>
          <a
            href={`/api/admin/job-resumes/${applicant.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline font-medium"
          >
            {applicant.resumeOriginalFilename} →
          </a>
        </div>
        {applicant.coverLetter && (
          <div className="col-span-2">
            <p className="text-ink-soft">Cover letter</p>
            <p className="text-ink whitespace-pre-wrap">{applicant.coverLetter}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <ApplicantStatusHistory history={history} />
      </div>

      <div className="mt-6">
        <ApplicantPipelineControl
          applicantId={applicant.id}
          jobPostingId={applicant.jobPostingId}
          currentStatus={applicant.status}
          currentNotes={applicant.notes}
        />
      </div>
    </div>
  );
}
