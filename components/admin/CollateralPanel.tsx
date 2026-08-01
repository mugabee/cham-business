"use client";
import { useActionState, useState } from "react";
import { registerCollateralAction, deregisterCollateralAction } from "@/app/actions/loans";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

export type CollateralItem = {
  id: number;
  description: string;
  estimatedValue: number | null;
  registeredAt: string | Date;
  deregisteredAt: string | Date | null;
};

function DeregisterButton({ id, loanId }: { id: number; loanId: number }) {
  const [state, action, pending] = useActionState(deregisterCollateralAction, undefined);
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Deregister this collateral? This is free of charge and should be done once the loan is fully repaid."))
      e.preventDefault();
  }
  return (
    <form action={action} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="loanId" value={loanId} />
      <button type="submit" disabled={pending} className="text-xs font-medium text-brand hover:underline disabled:opacity-50">
        Deregister
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

export default function CollateralPanel({
  loanId,
  collateral,
  showDeregisterReminder,
}: {
  loanId: number;
  collateral: CollateralItem[];
  showDeregisterReminder: boolean;
}) {
  const [state, action, pending] = useActionState(registerCollateralAction, undefined);
  const [open, setOpen] = useState(false);

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";

  return (
    <div className="bg-white rounded-2xl border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-ink">Collateral</h2>
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-sm font-medium text-brand hover:underline">
          {open ? "Close" : "+ Register collateral"}
        </button>
      </div>

      {showDeregisterReminder && (
        <p className="mb-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          This loan is fully repaid — deregister any remaining collateral (free of charge, within 15 days of settlement).
        </p>
      )}

      {open && (
        <form action={action} className="mb-4 space-y-3 rounded-lg bg-paper-deep p-3">
          <input type="hidden" name="loanId" value={loanId} />
          <input name="description" placeholder="Description (e.g. plot title deed no. ...)" required className={field} />
          <input name="estimatedValue" type="number" min={1} placeholder="Estimated value (RWF, optional)" className={field} />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            {pending ? "Registering…" : "Register collateral"}
          </button>
        </form>
      )}

      {collateral.length === 0 ? (
        <p className="text-sm text-ink-soft">No collateral registered against this loan.</p>
      ) : (
        <ul className="divide-y divide-line text-sm">
          {collateral.map((c) => (
            <li key={c.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-ink">{c.description}</p>
                <p className="text-ink-soft text-xs">
                  {c.estimatedValue ? `${formatRWF(c.estimatedValue)} · ` : ""}
                  Registered {formatDate(c.registeredAt)}
                  {c.deregisteredAt ? ` · Deregistered ${formatDate(c.deregisteredAt)}` : ""}
                </p>
              </div>
              {c.deregisteredAt ? (
                <StatusBadge label="deregistered" tone="neutral" />
              ) : (
                <DeregisterButton id={c.id} loanId={loanId} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
