"use client";
import { useActionState } from "react";
import { setApplicantRatingAction } from "@/app/actions/jobs";
import { APPLICANT_RATING_LABELS, type ApplicantRating } from "@/lib/job-types";

export default function ApplicantRatingControl({
  applicantId,
  jobPostingId,
  currentRating,
}: {
  applicantId: number;
  jobPostingId: number;
  currentRating: ApplicantRating;
}) {
  const [state, formAction, pending] = useActionState(setApplicantRatingAction, undefined);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="applicantId" value={applicantId} />
      <input type="hidden" name="jobPostingId" value={jobPostingId} />
      <label className="text-xs font-medium text-ink-soft">Screening tag</label>
      <select
        name="rating"
        defaultValue={currentRating}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        disabled={pending}
        className="rounded-lg border border-line px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand-soft"
      >
        {Object.entries(APPLICANT_RATING_LABELS).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
