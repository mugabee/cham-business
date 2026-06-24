import Link from "next/link";
import type { LoanProduct } from "@/lib/site";
import { loanTerms } from "@/lib/site";

export default function LoanCard({ loan }: { loan: LoanProduct }) {
  return (
    <div className="group flex flex-col rounded-3xl border border-[var(--color-line)] bg-white p-7 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(37,99,184,0.10)]">
      <h3 className="font-display text-xl font-bold text-[var(--color-ink)]">
        {loan.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        {loan.blurb}
      </p>

      <dl className="mt-5 space-y-2 border-t border-[var(--color-line)] pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">Amount</dt>
          <dd className="font-semibold text-[var(--color-ink)]">{loanTerms.range}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">Term</dt>
          <dd className="font-semibold text-[var(--color-ink)]">{loanTerms.term}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">Rate</dt>
          <dd className="font-semibold text-[var(--color-ink)]">{loanTerms.rate}</dd>
        </div>
      </dl>

      <Link
        href="/apply"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand)] transition-all group-hover:gap-2.5"
      >
        Apply for this loan
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
