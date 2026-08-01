"use client";
import { useActionState, useState } from "react";
import {
  applyPenaltyAction,
  markPenaltyPaidAction,
  waivePenaltyAction,
} from "@/app/actions/loans";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

export type PenaltyItem = {
  id: number;
  amount: number;
  reason: string;
  status: "pending" | "paid" | "waived";
  appliedAt: string | Date;
  appliedByEmail: string | null;
};

const statusTone = { pending: "warning", paid: "success", waived: "neutral" } as const;

function ResolveButton({
  penaltyId,
  loanId,
  action,
  label,
}: {
  penaltyId: number;
  loanId: number;
  action: typeof markPenaltyPaidAction;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="penaltyId" value={penaltyId} />
      <input type="hidden" name="loanId" value={loanId} />
      <button type="submit" disabled={pending} className="text-xs font-medium text-brand hover:underline disabled:opacity-50">
        {pending ? "…" : label}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

export default function PenaltyPanel({ loanId, penalties }: { loanId: number; penalties: PenaltyItem[] }) {
  const [state, action, pending] = useActionState(applyPenaltyAction, undefined);
  const [open, setOpen] = useState(false);

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";

  return (
    <div className="bg-white rounded-2xl border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-ink">Penalties</h2>
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-sm font-medium text-brand hover:underline">
          {open ? "Close" : "+ Add penalty"}
        </button>
      </div>

      {open && (
        <form action={action} className="mb-4 space-y-3 rounded-lg bg-paper-deep p-3">
          <input type="hidden" name="loanId" value={loanId} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="amount" type="number" min={1} placeholder="Amount (RWF)" required className={field} />
            <input name="reason" placeholder="Reason (e.g. overdue instalment #3)" required className={field} />
          </div>
          <p className="text-xs text-ink-soft">
            Capped automatically so total penalties never exceed this loan&apos;s outstanding principal (in duplum rule).
          </p>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            {pending ? "Applying…" : "Apply penalty"}
          </button>
        </form>
      )}

      {penalties.length === 0 ? (
        <p className="text-sm text-ink-soft">No penalties charged on this loan.</p>
      ) : (
        <ul className="divide-y divide-line text-sm">
          {penalties.map((p) => (
            <li key={p.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-ink">
                  {formatRWF(p.amount)} — {p.reason}
                </p>
                <p className="text-ink-soft text-xs">
                  {formatDate(p.appliedAt)} {p.appliedByEmail ? `by ${p.appliedByEmail}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge label={p.status} tone={statusTone[p.status]} />
                {p.status === "pending" && (
                  <>
                    <ResolveButton penaltyId={p.id} loanId={loanId} action={markPenaltyPaidAction} label="Mark paid" />
                    <ResolveButton penaltyId={p.id} loanId={loanId} action={waivePenaltyAction} label="Waive" />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
