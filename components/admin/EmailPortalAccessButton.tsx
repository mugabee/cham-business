"use client";
import { useActionState } from "react";
import { emailPortalAccessAction } from "@/app/actions/borrowers";

export default function EmailPortalAccessButton({ borrowerId }: { borrowerId: number }) {
  const [state, action, pending] = useActionState(emailPortalAccessAction, undefined);

  if (state?.success) {
    return <span className="text-sm text-green-700">Access email sent.</span>;
  }

  return (
    <form action={action} className="inline-flex items-center gap-2">
      <input type="hidden" name="id" value={borrowerId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-line hover:bg-paper-deep text-ink text-sm font-medium px-4 py-2 transition-colors disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email portal access"}
      </button>
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
