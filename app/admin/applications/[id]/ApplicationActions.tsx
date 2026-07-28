"use client";
import { useActionState } from "react";
import { approveApplicationAction, rejectApplicationAction } from "@/app/actions/applications";

export default function ApplicationActions({
  applicationId,
  amountRequested,
  isNewBorrower,
}: {
  applicationId: number;
  amountRequested: number;
  isNewBorrower: boolean;
}) {
  const [approveState, approveAction, approvePending] = useActionState(
    approveApplicationAction,
    undefined
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectApplicationAction,
    undefined
  );

  const today = new Date().toISOString().slice(0, 10);
  const field =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  if (approveState?.success) {
    return (
      <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        Application approved — borrower and loan created.
      </p>
    );
  }

  if (rejectState?.success) {
    return (
      <p className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-600">
        Application rejected.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <form action={approveAction} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Approve &amp; create loan</h2>
        <input type="hidden" name="applicationId" value={applicationId} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Approved amount (RWF)</label>
            <input
              name="principal"
              type="number"
              min={1}
              defaultValue={amountRequested}
              required
              className={field}
            />
          </div>
          <div>
            <label className={label}>Term (months)</label>
            <input name="termMonths" type="number" min={1} max={60} required className={field} />
          </div>
        </div>

        <div>
          <label className={label}>Disbursement date</label>
          <input name="disbursedAt" type="date" defaultValue={today} required className={field} />
        </div>

        {isNewBorrower && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>National ID</label>
              <input name="nationalId" className={field} placeholder="Verified in person" />
            </div>
            <div>
              <label className={label}>Address</label>
              <input name="address" className={field} />
            </div>
          </div>
        )}

        <div>
          <label className={label}>Notes (optional)</label>
          <textarea name="notes" rows={2} className={field} />
        </div>

        {approveState?.error && <p className="text-sm text-red-600">{approveState.error}</p>}

        <button
          type="submit"
          disabled={approvePending}
          className="rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          {approvePending ? "Approving…" : "Approve & create loan"}
        </button>
      </form>

      <form action={rejectAction} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Reject</h2>
        <input type="hidden" name="applicationId" value={applicationId} />
        <div>
          <label className={label}>Reason</label>
          <textarea name="notes" rows={2} required className={field} />
        </div>
        {rejectState?.error && <p className="text-sm text-red-600">{rejectState.error}</p>}
        <button
          type="submit"
          disabled={rejectPending}
          className="rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-700 text-sm font-medium px-4 py-2 transition-colors"
        >
          {rejectPending ? "Rejecting…" : "Reject"}
        </button>
      </form>
    </div>
  );
}
