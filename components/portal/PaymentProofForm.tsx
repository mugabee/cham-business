"use client";
import { useActionState } from "react";
import { submitPaymentProofAction } from "@/app/actions/portal-payments";

export default function PaymentProofForm({ loanId }: { loanId: number }) {
  const [state, action, pending] = useActionState(submitPaymentProofAction, undefined);

  const field =
    "w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";

  if (state?.success) {
    return (
      <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        Thanks! Your payment proof has been submitted and is awaiting review by our team.
      </p>
    );
  }

  return (
    <form action={action} className="bg-white rounded-2xl border border-line p-5 space-y-4">
      <input type="hidden" name="loanId" value={loanId} />
      <h3 className="font-semibold text-ink">Submit payment proof</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Amount paid (RWF)</label>
          <input name="amountClaimed" type="number" min={1} required className={field} />
        </div>
        <div>
          <label className={label}>Method</label>
          <select name="method" required defaultValue="" className={field}>
            <option value="" disabled>Choose one</option>
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
        <label className={label}>Receipt / screenshot</label>
        <input
          name="receipt"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className={`${field} file:mr-3 file:rounded file:border-0 file:bg-brand-wash file:px-2 file:py-1 file:text-xs file:font-medium file:text-brand`}
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        {pending ? "Submitting…" : "Submit proof"}
      </button>
    </form>
  );
}
