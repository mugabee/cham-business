"use client";
import { useActionState } from "react";
import { updatePaymentAction } from "@/app/actions/payments";

export default function PaymentEditForm({
  payment,
}: {
  payment: { id: number; loanId: number; reference: string | null; notes: string | null };
}) {
  const [state, action, pending] = useActionState(updatePaymentAction, undefined);

  const field =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form action={action} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 max-w-lg">
      <input type="hidden" name="paymentId" value={payment.id} />
      <input type="hidden" name="loanId" value={payment.loanId} />
      <div>
        <label className={label}>Reference (optional)</label>
        <input name="reference" defaultValue={payment.reference ?? ""} className={field} placeholder="Transaction ID" />
      </div>
      <div>
        <label className={label}>Notes (optional)</label>
        <textarea name="notes" rows={3} defaultValue={payment.notes ?? ""} className={field} />
      </div>
      <p className="text-xs text-gray-400">
        Amount, method, and date can&apos;t be edited here — delete and re-record the payment instead if
        those need to change.
      </p>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
