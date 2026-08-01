import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import LoanCalculator from "@/components/LoanCalculator";
import {
  loanProducts,
  loanTerms,
  interestExplainer,
  applyRequirements,
  repaymentExplainer,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Loan Products — Cham Business Ltd",
  description:
    "Six loan types, one clear rate. RWF 300,000–20,000,000 at 5% per month on the reducing balance, repayment agreed with you.",
};

// See app/(public)/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default function LoansPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our loans"
        title="Six loans, one clear rate"
        subtitle="Every loan type we offer carries the same 5% monthly reducing-balance rate and the same honest terms. No surprises."
      />

      {/* Quick-facts banner */}
      <section className="bg-[var(--color-brand)] text-white">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <dl className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {[
              { label: "Loan amount", value: loanTerms.range },
              { label: "Interest rate", value: loanTerms.rate },
              { label: "Repayment period", value: loanTerms.term },
            ].map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {f.label}
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold text-[var(--color-accent-soft)]">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Loan types */}
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
                <p className="mt-3 leading-relaxed text-[var(--color-ink-soft)]">
                  {loan.description}
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
                    <dd className="font-semibold text-[var(--color-ink)]">
                      {loanTerms.range}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-ink-soft)]">Rate</dt>
                    <dd className="font-semibold text-[var(--color-ink)]">
                      {loanTerms.rate}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-ink-soft)]">Term</dt>
                    <dd className="font-semibold text-[var(--color-ink)]">
                      {loanTerms.term}
                    </dd>
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
      </section>

      {/* How our interest works */}
      <section className="bg-[var(--color-brand-wash)]">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <h2 className="font-display text-3xl font-extrabold text-[var(--color-ink)]">
            {interestExplainer.headline}
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--color-ink-soft)]">
            {interestExplainer.summary}
          </p>

          {/* Worked example */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-[var(--color-line)] bg-white">
            <div className="border-b border-[var(--color-line)] px-7 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
                Worked example
              </p>
              <p className="mt-1 font-display text-lg font-bold text-[var(--color-ink)]">
                Borrow {interestExplainer.example.principal} for{" "}
                {interestExplainer.example.months}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-0 divide-x divide-y divide-[var(--color-line)] md:grid-cols-4 md:divide-y-0">
              {[
                { label: "Principal", value: interestExplainer.example.principal },
                {
                  label: "Monthly payment",
                  value: interestExplainer.example.monthlyPayment,
                },
                {
                  label: "Total interest",
                  value: interestExplainer.example.totalInterest,
                },
                {
                  label: "Total repayment",
                  value: interestExplainer.example.totalRepayment,
                  highlight: true,
                },
              ].map((cell) => (
                <div key={cell.label} className="px-6 py-5">
                  <dt className="text-xs text-[var(--color-ink-soft)]">
                    {cell.label}
                  </dt>
                  <dd
                    className={`mt-1 font-display text-xl font-bold ${
                      cell.highlight
                        ? "text-[var(--color-brand)]"
                        : "text-[var(--color-ink)]"
                    }`}
                  >
                    {cell.value}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="border-t border-[var(--color-line)] px-7 py-4 text-sm text-[var(--color-ink-soft)]">
              {interestExplainer.example.breakdown}
            </p>
            <p className="border-t border-[var(--color-line)] px-7 py-4 text-xs text-[var(--color-ink-soft)] italic">
              {interestExplainer.example.disclaimer}
            </p>
          </div>

          <div className="mt-8">
            <LoanCalculator />
          </div>
        </div>
      </section>

      {/* Repaying your loan */}
      <section className="mx-auto max-w-4xl px-5 py-16">
        <h2 className="font-display text-3xl font-extrabold text-[var(--color-ink)]">
          Repaying your loan
        </h2>
        <p className="mt-4 leading-relaxed text-[var(--color-ink-soft)]">
          {repaymentExplainer}
        </p>
      </section>

      {/* What you need to apply */}
      <section className="bg-[var(--color-paper-deep)]">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <h2 className="font-display text-3xl font-extrabold text-[var(--color-ink)]">
            What you need to apply
          </h2>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            We keep the requirements minimal — just enough for us to assess your
            application fairly.
          </p>
          <ul className="mt-8 space-y-4">
            {applyRequirements.map((req) => (
              <li
                key={req.label}
                className="flex gap-4 rounded-2xl border border-[var(--color-line)] bg-white p-5"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-wash)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-[var(--color-brand)]"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-[var(--color-ink)]">
                    {req.label}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">
                    {req.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 text-center">
            <Link
              href="/apply"
              className="inline-block rounded-full bg-[var(--color-brand)] px-8 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)]"
            >
              Start your application
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
