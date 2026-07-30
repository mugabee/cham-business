"use client";
import { useActionState, useState } from "react";
import { confirmPaymentProofAction, rejectPaymentProofAction } from "@/app/actions/payment-proofs";

export default function PaymentProofReviewControls({ id }: { id: number }) {
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmPaymentProofAction, undefined);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectPaymentProofAction, undefined);
  const [showReject, setShowReject] = useState(false);

  if (confirmState?.success || rejectState?.success) {
    return <span className="text-sm text-gray-400">Reviewed</span>;
  }

  function handleConfirmSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Confirm this payment? It will be recorded against the loan.")) {
      e.preventDefault();
    }
  }

  if (showReject) {
    return (
      <form action={rejectAction} className="space-y-2 max-w-xs">
        <input type="hidden" name="id" value={id} />
        <textarea
          name="note"
          rows={2}
          required
          placeholder="Reason for rejecting"
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
        />
        {rejectState?.error && <p className="text-xs text-red-600">{rejectState.error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={rejectPending} className="text-xs font-medium text-red-600 hover:underline">
            {rejectPending ? "Rejecting…" : "Confirm reject"}
          </button>
          <button type="button" onClick={() => setShowReject(false)} className="text-xs text-gray-400 hover:underline">
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <form action={confirmAction} onSubmit={handleConfirmSubmit}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" disabled={confirmPending} className="text-sm font-medium text-green-700 hover:underline">
          {confirmPending ? "Confirming…" : "Confirm"}
        </button>
      </form>
      <button type="button" onClick={() => setShowReject(true)} className="text-sm font-medium text-red-600 hover:underline">
        Reject
      </button>
      {confirmState?.error && <p className="text-xs text-red-600">{confirmState.error}</p>}
    </div>
  );
}
