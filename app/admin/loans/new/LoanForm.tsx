"use client";
import { useActionState } from "react";
import { createLoanAction } from "@/app/actions/loans";

export default function LoanForm({
  borrowers,
  preselectedBorrowerId,
}: {
  borrowers: { id: number; fullName: string }[];
  preselectedBorrowerId?: number;
}) {
  const [state, action, pending] = useActionState(createLoanAction, undefined);
  const today = new Date().toISOString().slice(0, 10);

  const field =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form action={action} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 max-w-lg">
      <div>
        <label className={label}>Borrower</label>
        <select
          name="borrowerId"
          required
          defaultValue={preselectedBorrowerId ?? ""}
          className={field}
        >
          <option value="" disabled>
            Choose a borrower
          </option>
          {borrowers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Principal (RWF)</label>
          <input name="principal" type="number" min={1} required className={field} />
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

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Creating…" : "Create loan"}
      </button>
    </form>
  );
}
