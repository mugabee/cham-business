import Link from "next/link";

type LoanCardProps = {
  name: string;
  blurb: string;
  range: string;
  term: string;
};

export default function LoanCard({ name, blurb, range, term }: LoanCardProps) {
  return (
    <div className="group flex flex-col rounded-2xl border border-[var(--color-line)] bg-white p-7 transition-shadow hover:shadow-[0_8px_30px_rgba(11,61,46,0.08)]">
      <h3 className="font-display text-xl font-semibold text-[var(--color-forest)]">
        {name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">
        {blurb}
      </p>

      <dl className="mt-5 space-y-2 border-t border-[var(--color-line)] pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">Amount</dt>
          <dd className="font-semibold text-[var(--color-ink)]">{range}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--color-ink-soft)]">Term</dt>
          <dd className="font-semibold text-[var(--color-ink)]">{term}</dd>
        </div>
      </dl>

      <Link
        href="/apply"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-forest)] group-hover:gap-2.5 transition-all"
      >
        Apply for this loan
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
