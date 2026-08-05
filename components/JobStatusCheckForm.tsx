"use client";
import { useActionState } from "react";
import { checkApplicationStatusAction } from "@/app/actions/job-applications";
import { APPLICANT_STATUS_LABELS } from "@/lib/job-types";
import { formatDate } from "@/lib/format";

export default function JobStatusCheckForm() {
  const [state, formAction, pending] = useActionState(checkApplicationStatusAction, undefined);

  const field =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-brand)]";

  return (
    <div className="space-y-6">
      <form action={formAction} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className={`${field} flex-1`}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[var(--color-brand)] px-6 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)] disabled:opacity-60"
        >
          {pending ? "Checking…" : "Check status"}
        </button>
      </form>

      {state?.error && (
        <p className="rounded-xl bg-[var(--color-accent)]/15 px-4 py-3 text-sm text-[var(--color-accent-deep)]">
          {state.error}
        </p>
      )}

      {state?.results && (
        <div className="space-y-3">
          {state.results.map((r, i) => (
            <div key={i} className="rounded-2xl border border-[var(--color-line)] bg-white p-5">
              <p className="font-semibold text-[var(--color-ink)]">{r.jobPostingTitle}</p>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                Applied {formatDate(r.submittedAt)}
              </p>
              <p className="mt-2 inline-block rounded-full bg-[var(--color-brand-wash)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-deep)]">
                {APPLICANT_STATUS_LABELS[r.status as keyof typeof APPLICANT_STATUS_LABELS]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
