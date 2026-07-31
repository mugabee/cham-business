"use client";
import { useActionState } from "react";
import { recordPaymentAction } from "@/app/actions/payments";

export default function PaymentForm({
  loans,
  preselectedLoanId,
}: {
  loans: { id: number; borrowerName: string; outstanding: number }[];
  preselectedLoanId?: number;
}) {
  const [state, action, pending] = useActionState(recordPaymentAction, undefined);

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";

  return (
    <form action={action} className="bg-white rounded-2xl border border-line p-5 space-y-4 max-w-lg">
      <div>
        <label className={label}>Loan</label>
        <select name="loanId" required defaultValue={preselectedLoanId ?? ""} className={field}>
          <option value="" disabled>
            Choose a loan
          </option>
          {loans.map((loan) => (
            <option key={loan.id} value={loan.id}>
              {loan.borrowerName} — {loan.outstanding.toLocaleString()} RWF outstanding
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Amount (RWF)</label>
          <input name="amount" type="number" min={1} required className={field} />
        </div>
        <div>
          <label className={label}>Method</label>
          <select name="method" required defaultValue="" className={field}>
            <option value="" disabled>
              Choose one
            </option>
            <option value="mtn">MTN Mobile Money</option>
            <option value="airtel">Airtel Money</option>
            <option value="bank">Bank transfer</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Reference (optional)</label>
        <input name="reference" className={field} placeholder="Transaction ID" />
      </div>

      <div>
        <label className={label}>Notes (optional)</label>
        <textarea name="notes" rows={2} className={field} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Recording…" : "Record payment"}
      </button>
    </form>
  );
}
