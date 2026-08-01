"use client";
import { useActionState, useState } from "react";
import { updateComplaintStatusAction } from "@/app/actions/complaints";

export default function ComplaintStatusControls({
  complaintId,
  currentStatus,
}: {
  complaintId: number;
  currentStatus: "open" | "investigating" | "resolved" | "rejected";
}) {
  const [state, action, pending] = useActionState(updateComplaintStatusAction, undefined);
  const [open, setOpen] = useState(false);

  if (state?.success && !open) {
    return <p className="text-xs text-ink-soft">Updated.</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-brand hover:underline">
        Update status
      </button>
    );
  }

  return (
    <form action={action} className="space-y-2 rounded-lg bg-paper-deep p-3">
      <input type="hidden" name="complaintId" value={complaintId} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft"
      >
        <option value="open">Open</option>
        <option value="investigating">Investigating</option>
        <option value="resolved">Resolved</option>
        <option value="rejected">Rejected</option>
      </select>
      <textarea
        name="resolutionNotes"
        rows={2}
        placeholder="Resolution notes (visible internally)"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft"
      />
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-xs font-medium px-3 py-1.5 transition-colors"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-ink-soft hover:underline">
          Cancel
        </button>
      </div>
    </form>
  );
}
