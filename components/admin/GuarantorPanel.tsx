"use client";
import { useActionState, useState } from "react";
import { addGuarantorAction, removeGuarantorAction } from "@/app/actions/loans";
import { formatDate } from "@/lib/format";

export type GuarantorItem = {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  relationshipToBorrower: string | null;
  repaymentNotifiedAt: string | Date | null;
};

function RemoveButton({ id, loanId }: { id: number; loanId: number }) {
  const [state, action, pending] = useActionState(removeGuarantorAction, undefined);
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Remove this guarantor from the loan?")) e.preventDefault();
  }
  return (
    <form action={action} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="loanId" value={loanId} />
      <button type="submit" disabled={pending} className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50">
        Remove
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

export default function GuarantorPanel({ loanId, guarantors }: { loanId: number; guarantors: GuarantorItem[] }) {
  const [state, action, pending] = useActionState(addGuarantorAction, undefined);
  const [open, setOpen] = useState(false);

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";

  return (
    <div className="bg-white rounded-2xl border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-ink">Guarantors</h2>
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-sm font-medium text-brand hover:underline">
          {open ? "Close" : "+ Add guarantor"}
        </button>
      </div>

      {open && (
        <form action={action} className="mb-4 space-y-3 rounded-lg bg-paper-deep p-3">
          <input type="hidden" name="loanId" value={loanId} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="fullName" placeholder="Full name" required className={field} />
            <input name="phone" placeholder="Phone" required className={field} />
            <input name="email" type="email" placeholder="Email (for repayment notice)" className={field} />
            <input name="relationshipToBorrower" placeholder="Relationship to borrower" className={field} />
          </div>
          <input name="address" placeholder="Address (optional)" className={field} />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            {pending ? "Adding…" : "Add guarantor"}
          </button>
        </form>
      )}

      {guarantors.length === 0 ? (
        <p className="text-sm text-ink-soft">No guarantor on this loan.</p>
      ) : (
        <ul className="divide-y divide-line text-sm">
          {guarantors.map((g) => (
            <li key={g.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-ink">
                  {g.fullName} {g.relationshipToBorrower ? `(${g.relationshipToBorrower})` : ""}
                </p>
                <p className="text-ink-soft text-xs">
                  {g.phone} {g.email ? `· ${g.email}` : ""}
                  {g.repaymentNotifiedAt ? ` · notified of full repayment ${formatDate(g.repaymentNotifiedAt)}` : ""}
                </p>
              </div>
              <RemoveButton id={g.id} loanId={loanId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
