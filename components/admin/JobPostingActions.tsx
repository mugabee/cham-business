"use client";
import { useActionState } from "react";
import {
  publishJobPostingAction,
  closeJobPostingAction,
  deleteJobPostingAction,
} from "@/app/actions/jobs";

export default function JobPostingActions({
  id,
  status,
  applicantCount,
}: {
  id: number;
  status: "draft" | "open" | "closed";
  applicantCount: number;
}) {
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteJobPostingAction,
    undefined
  );

  const canDelete = applicantCount === 0;

  function handleDeleteSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Permanently delete this job posting? This cannot be undone.")) {
      e.preventDefault();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status !== "open" && (
        <form action={publishJobPostingAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded-lg bg-brand hover:bg-brand-deep text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            {status === "draft" ? "Publish" : "Reopen"}
          </button>
        </form>
      )}
      {status === "open" && (
        <form action={closeJobPostingAction}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded-lg border border-line hover:bg-paper-deep text-ink text-sm font-medium px-4 py-2 transition-colors"
          >
            Close posting
          </button>
        </form>
      )}

      <form action={deleteFormAction} onSubmit={handleDeleteSubmit}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={deletePending || !canDelete}
          title={!canDelete ? "Has applicants -- close the posting instead" : undefined}
          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:no-underline"
        >
          {deletePending ? "Deleting…" : "Delete permanently"}
        </button>
      </form>

      {deleteState?.error && <span className="text-xs text-red-600">{deleteState.error}</span>}
      {!canDelete && (
        <span className="text-xs text-ink-soft">Has applicants -- close the posting instead of deleting it.</span>
      )}
    </div>
  );
}
