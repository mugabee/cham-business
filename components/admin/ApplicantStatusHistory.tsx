import { APPLICANT_STATUS_LABELS, type JobApplicantStatusHistoryEntry } from "@/lib/job-types";
import { formatDate } from "@/lib/format";

export default function ApplicantStatusHistory({
  history,
}: {
  history: JobApplicantStatusHistoryEntry[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-line p-5">
      <h2 className="font-semibold text-ink mb-4">Pipeline history</h2>
      <ol className="space-y-4">
        {history.map((entry, i) => (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className={`h-2.5 w-2.5 rounded-full ${i === history.length - 1 ? "bg-brand" : "bg-line"}`} />
              {i < history.length - 1 && <span className="w-px flex-1 bg-line" />}
            </div>
            <div className="pb-1">
              <p className="text-sm font-medium text-ink">{APPLICANT_STATUS_LABELS[entry.status]}</p>
              <p className="text-xs text-ink-soft">
                {formatDate(entry.changedAt)}
                {entry.changedByEmail ? ` -- ${entry.changedByEmail}` : ""}
              </p>
              {entry.notes && <p className="mt-1 text-sm text-ink">{entry.notes}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
