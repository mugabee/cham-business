"use client";
import { useState, useActionState } from "react";
import Link from "next/link";
import { bulkUpdateApplicantStatusAction } from "@/app/actions/jobs";
import { APPLICANT_STATUS_LABELS, APPLICANT_RATING_LABELS, type JobApplicantListRow } from "@/lib/job-types";
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

export default function BulkApplicantTable({ applicants }: { applicants: JobApplicantListRow[] }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [state, formAction, pending] = useActionState(bulkUpdateApplicantStatusAction, undefined);

  const allSelected = applicants.length > 0 && selected.size === applicants.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(applicants.map((a) => a.id)));
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <form
          action={formAction}
          className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-brand-soft bg-brand-wash px-4 py-3"
        >
          {[...selected].map((id) => (
            <input key={id} type="hidden" name="applicantIds" value={id} />
          ))}
          <span className="text-sm font-medium text-brand-deep">{selected.size} selected</span>
          <select
            name="status"
            required
            defaultValue=""
            className="rounded-lg border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft"
          >
            <option value="" disabled>Set status to…</option>
            {Object.entries(APPLICANT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-1.5 transition-colors"
          >
            {pending ? "Applying…" : "Apply"}
          </button>
          {state?.error && <span className="text-sm text-red-600">{state.error}</span>}
        </form>
      )}

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-brand" />
              </th>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Applied for</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {applicants.map((applicant) => (
              <tr key={applicant.id} className="hover:bg-paper-deep">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(applicant.id)}
                    onChange={() => toggleOne(applicant.id)}
                    className="accent-brand"
                  />
                </td>
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
                <td className="px-4 py-3 text-ink-soft">{APPLICANT_RATING_LABELS[applicant.rating]}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={APPLICANT_STATUS_LABELS[applicant.status]} tone={applicantTone[applicant.status]} />
                  {applicant.status === "interview" && (
                    <p className="mt-1 text-xs text-ink-soft">
                      {applicant.interviewEmailSentAt ? "✓ Emailed" : "Not emailed"}
                    </p>
                  )}
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
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
