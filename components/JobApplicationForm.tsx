"use client";
import { useActionState } from "react";
import { submitJobApplicationAction } from "@/app/actions/job-applications";

export default function JobApplicationForm({ jobPostingId }: { jobPostingId: number }) {
  const [state, formAction, pending] = useActionState(submitJobApplicationAction, undefined);

  const field =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-brand)]";
  const label = "block text-sm font-semibold text-[var(--color-ink)]";

  if (state?.success) {
    return (
      <div className="rounded-3xl border border-[var(--color-line)] bg-white p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-brand-wash)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-[var(--color-ink)]">Application received</h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--color-ink-soft)]">
          Thank you for applying. We've emailed you a confirmation, and our team will be in touch if we'd
          like to move forward.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="jobPostingId" value={jobPostingId} />

      <div>
        <label htmlFor="fullName" className={label}>Full name</label>
        <input id="fullName" name="fullName" required className={`${field} mt-1.5`} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" name="email" type="email" required className={`${field} mt-1.5`} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone number</label>
          <input id="phone" name="phone" required className={`${field} mt-1.5`} placeholder="+250 ..." />
        </div>
      </div>

      <div>
        <label htmlFor="resume" className={label}>Resume / CV</label>
        <input
          id="resume"
          name="resume"
          type="file"
          required
          accept=".pdf,.doc,.docx,image/jpeg,image/png"
          className={`${field} mt-1.5`}
        />
        <p className="mt-1 text-xs text-[var(--color-ink-soft)]">PDF, Word, or image, up to 5MB.</p>
      </div>

      <div>
        <label htmlFor="coverLetter" className={label}>
          Cover letter <span className="font-normal text-[var(--color-ink-soft)]">(optional)</span>
        </label>
        <textarea id="coverLetter" name="coverLetter" rows={5} maxLength={3000} className={`${field} mt-1.5`} />
      </div>

      {state?.error && (
        <p className="rounded-xl bg-[var(--color-accent)]/15 px-4 py-3 text-sm text-[var(--color-accent-deep)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--color-brand)] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)] disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
