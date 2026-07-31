"use client";
import { useActionState } from "react";
import { updateApplicationAction } from "@/app/actions/applications";
import { loanProducts } from "@/lib/site";

export default function ApplicationEditForm({
  application,
}: {
  application: {
    id: number;
    fullName: string;
    phone: string;
    email: string | null;
    loanType: string;
    amountRequested: number;
    monthlyIncome: number;
    purpose: string;
  };
}) {
  const [state, action, pending] = useActionState(updateApplicationAction, undefined);

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";

  return (
    <form action={action} className="bg-white rounded-2xl border border-line p-5 space-y-4 max-w-lg">
      <input type="hidden" name="applicationId" value={application.id} />
      <div>
        <label className={label}>Full name</label>
        <input name="fullName" defaultValue={application.fullName} required className={field} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Phone</label>
          <input name="phone" defaultValue={application.phone} required className={field} />
        </div>
        <div>
          <label className={label}>Email (optional)</label>
          <input name="email" type="email" defaultValue={application.email ?? ""} className={field} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Loan type</label>
          <select name="loanType" defaultValue={application.loanType} required className={field}>
            {loanProducts.map((l) => (
              <option key={l.slug} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Amount requested (RWF)</label>
          <input
            name="amountRequested"
            type="number"
            min={1}
            required
            defaultValue={application.amountRequested}
            className={field}
          />
        </div>
      </div>
      <div>
        <label className={label}>Monthly income (RWF)</label>
        <input
          name="monthlyIncome"
          type="number"
          min={0}
          required
          defaultValue={application.monthlyIncome}
          className={field}
        />
      </div>
      <div>
        <label className={label}>Purpose</label>
        <textarea name="purpose" rows={3} defaultValue={application.purpose} required className={field} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
