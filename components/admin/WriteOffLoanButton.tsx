"use client";
import { useActionState } from "react";
import { writeOffLoanAction } from "@/app/actions/loans";

export default function WriteOffLoanButton({ loanId }: { loanId: number }) {
  const [state, formAction, pending] = useActionState(writeOffLoanAction, undefined);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Write off this loan? It will stop accruing as active and can then be permanently deleted if needed. This cannot be undone.")) {
      e.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="id" value={loanId} />
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Writing off..." : "Write off"}
      </button>
      {state?.error && <p className="text-xs text-red-600 mt-1">{state.error}</p>}
    </form>
  );
}
