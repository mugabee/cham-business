"use client";
import { useActionState } from "react";
import { submitComplaintAction } from "@/app/actions/portal-complaints";
import { COMPLAINT_CATEGORIES } from "@/lib/complaint-categories";

export default function ComplaintForm({ loanId }: { loanId?: number }) {
  const [state, action, pending] = useActionState(submitComplaintAction, undefined);

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";

  if (state?.success) {
    return (
      <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        Thank you — your complaint has been submitted. We&apos;ll review it and follow up.
      </p>
    );
  }

  return (
    <form action={action} className="bg-white rounded-2xl border border-line p-5 space-y-4">
      {loanId && <input type="hidden" name="loanId" value={loanId} />}
      <div>
        <label className={label}>What&apos;s this about?</label>
        <select name="category" required className={field}>
          <option value="">Choose a category</option>
          {COMPLAINT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Tell us what happened</label>
        <textarea name="description" rows={4} required className={field} />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Submitting…" : "Submit complaint"}
      </button>
    </form>
  );
}
