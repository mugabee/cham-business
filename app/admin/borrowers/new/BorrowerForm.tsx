"use client";
import { useActionState } from "react";
import { createBorrowerAction } from "@/app/actions/borrowers";

export default function BorrowerForm() {
  const [state, action, pending] = useActionState(createBorrowerAction, undefined);

  const field =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500";
  const label = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form action={action} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 max-w-lg">
      <div>
        <label className={label}>Full name</label>
        <input name="fullName" required className={field} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Phone</label>
          <input name="phone" required className={field} />
        </div>
        <div>
          <label className={label}>Email (optional)</label>
          <input name="email" type="email" className={field} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>National ID</label>
          <input name="nationalId" className={field} />
        </div>
        <div>
          <label className={label}>Monthly income (RWF)</label>
          <input name="monthlyIncome" type="number" min={0} required className={field} />
        </div>
      </div>
      <div>
        <label className={label}>Address</label>
        <input name="address" className={field} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Saving…" : "Add borrower"}
      </button>
    </form>
  );
}
