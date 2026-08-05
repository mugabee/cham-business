"use client";
import { useActionState } from "react";
import { updateApplicantStatusAction } from "@/app/actions/jobs";
import { APPLICANT_STATUS_LABELS, type ApplicantStatus } from "@/lib/job-types";

export default function ApplicantPipelineControl({
  applicantId,
  jobPostingId,
  currentStatus,
  currentNotes,
}: {
  applicantId: number;
  jobPostingId: number;
  currentStatus: ApplicantStatus;
  currentNotes: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateApplicantStatusAction, undefined);

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-line p-5 space-y-4">
      <input type="hidden" name="applicantId" value={applicantId} />
      <input type="hidden" name="jobPostingId" value={jobPostingId} />
      <h2 className="font-semibold text-ink">Hiring pipeline</h2>

      <div>
        <label className={label}>Status</label>
        <select name="status" required defaultValue={currentStatus} className={field}>
          {Object.entries(APPLICANT_STATUS_LABELS).map(([value, labelText]) => (
            <option key={value} value={value}>{labelText}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>
          Notes <span className="font-normal text-ink-soft">(interview feedback, next steps, etc.)</span>
        </label>
        <textarea name="notes" rows={4} defaultValue={currentNotes ?? ""} className={field} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Saving…" : "Update status"}
      </button>
      <p className="text-xs text-ink-soft">
        Moving to Interview, Offer, or Rejected automatically emails the candidate.
      </p>
    </form>
  );
}
