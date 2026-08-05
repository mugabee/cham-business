"use client";
import { useActionState } from "react";
import { subscribeToJobAlertsAction } from "@/app/actions/job-alerts";

export default function JobAlertSignupForm() {
  const [state, formAction, pending] = useActionState(subscribeToJobAlertsAction, undefined);

  if (state?.success) {
    return (
      <p className="text-sm text-[var(--color-brand-deep)]">
        You're on the list. We'll email you when a new position opens.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="flex-1 rounded-xl border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-brand)]"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)] disabled:opacity-60"
      >
        {pending ? "Adding…" : "Notify me"}
      </button>
      {state?.error && <p className="text-xs text-[var(--color-accent-deep)] sm:ml-2">{state.error}</p>}
    </form>
  );
}
