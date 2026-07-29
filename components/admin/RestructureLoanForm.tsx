"use client";
import { useActionState, useState } from "react";
import { restructureLoanAction } from "@/app/actions/loans";

export default function RestructureLoanForm({
  loanId,
  currentRatePercent,
}: {
  loanId: number;
  currentRatePercent: number;
}) {
  const [state, action, pending] = useActionState(restructureLoanAction, undefined);
  const [open, setOpen] = useState(false);

  const field =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";
  const today = new Date().toISOString().slice(0, 10);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-amber-700 hover:underline"
      >
        Restructure loan
      </button>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (
      !confirm(
        "Restructure this loan? The outstanding balance will be spread over a new schedule starting from the effective date. Already-paid instalments are not affected. This cannot be undone."
      )
    ) {
      e.preventDefault();
    }
  }

  return (
    <form
      action={action}
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 max-w-lg mt-3"
    >
      <input type="hidden" name="loanId" value={loanId} />
      <h3 className="text-sm font-semibold text-gray-900">Restructure loan</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>New term (months)</label>
          <input name="newTermMonths" type="number" min={1} max={60} required className={field} />
        </div>
        <div>
          <label className={label}>New monthly rate % (optional)</label>
          <input
            name="newMonthlyRatePercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            defaultValue={currentRatePercent}
            className={field}
          />
        </div>
      </div>
      <div>
        <label className={label}>Effective date</label>
        <input name="effectiveDate" type="date" defaultValue={today} required className={field} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          {pending ? "Restructuring…" : "Restructure"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
