import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { loanProducts } from "@/lib/site";

export const metadata: Metadata = {
  title: "Loan Products — Cham Business Ltd",
  description: "Explore personal loans, salary advances, and business loans for individuals in Rwanda.",
};

export default function LoansPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our loans"
        title="Loans built around real life"
        subtitle="Clear terms, fair rates, and a process that respects your time. Pick the one that fits."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="space-y-6">
          {loanProducts.map((loan) => (
            <div
              key={loan.slug}
              className="grid gap-6 rounded-3xl border border-[var(--color-line)] bg-white p-7 md:grid-cols-3 md:p-9"
            >
              <div className="md:col-span-2">
                <h2 className="font-display text-2xl font-bold text-[var(--color-ink)]">
                  {loan.name}
                </h2>
                <p className="mt-2 max-w-lg leading-relaxed text-[var(--color-ink-soft)]">
                  {loan.blurb}
                </p>
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
                    Good for
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {loan.goodFor.map((g) => (
                      <span
                        key={g}
                        className="rounded-full bg-[var(--color-brand-wash)] px-3 py-1 text-sm font-medium text-[var(--color-brand-deep)]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl bg-[var(--color-paper-deep)] p-6">
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-[var(--color-ink-soft)]">Amount</dt>
                    <dd className="font-semibold text-[var(--color-ink)]">{loan.range}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-ink-soft)]">Term</dt>
                    <dd className="font-semibold text-[var(--color-ink)]">{loan.term}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-ink-soft)]">Rate</dt>
                    <dd className="font-semibold text-[var(--color-ink)]">{loan.rate}</dd>
                  </div>
                </dl>
                <Link
                  href="/apply"
                  className="mt-5 rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)]"
                >
                  Apply now
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-[var(--color-ink-soft)]">
          Rates shown are indicative starting points and depend on your assessment.
          The full cost of your loan is always shown clearly before you accept.
        </p>
      </section>
    </>
  );
}
