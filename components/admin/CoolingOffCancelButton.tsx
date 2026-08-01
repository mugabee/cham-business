"use client";
import { useActionState, useState } from "react";
import { cancelLoanCoolingOffAction } from "@/app/actions/loans";

export default function CoolingOffCancelButton({
  loanId,
  daysRemaining,
}: {
  loanId: number;
  daysRemaining: number;
}) {
  const [state, action, pending] = useActionState(cancelLoanCoolingOffAction, undefined);
  const [open, setOpen] = useState(false);

  if (state?.success) {
    return (
      <p className="rounded-lg bg-paper-deep border border-line px-3 py-2 text-sm text-ink-soft">
        Loan cancelled under the cooling-off period.
      </p>
    );
  }

  if (!open) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-center justify-between gap-3">
        <p className="text-sm text-amber-800">
          Cooling-off eligible — no payments yet, {daysRemaining} day{daysRemaining === 1 ? "" : "s"} left to cancel free of charge.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 text-sm font-medium text-amber-900 hover:underline"
        >
          Cancel loan
        </button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Cancel this loan under the cooling-off period? No penalty is applied, but this cannot be undone.")) {
      e.preventDefault();
    }
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-amber-200 p-4 space-y-3"
    >
      <input type="hidden" name="loanId" value={loanId} />
      <h3 className="text-sm font-semibold text-ink">Cancel loan (cooling-off period)</h3>
      <textarea
        name="reason"
        rows={2}
        required
        placeholder="Reason for cancellation"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          {pending ? "Cancelling…" : "Confirm cancellation"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink-soft hover:underline">
          Back
        </button>
      </div>
    </form>
  );
}
