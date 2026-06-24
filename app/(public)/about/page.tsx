import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "About — Cham Business Ltd",
  description: "Learn about Cham Business Ltd, a registered non-deposit lender serving individuals across Rwanda.",
};

const values = [
  { title: "Fairness first", text: "We only lend what we believe you can comfortably repay. Your wellbeing matters more than a quick sale." },
  { title: "Total clarity", text: "Every cost is on the table before you sign. No fine print, no surprise fees." },
  { title: "Real people", text: "You'll deal with a team that listens. If life happens, we work with you, not against you." },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A lender that puts people first"
        subtitle="We built Cham Business to make borrowing in Rwanda fairer, clearer, and more human."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="prose-custom space-y-5 text-lg leading-relaxed text-[var(--color-ink-soft)]">
          <p>
            Cham Business Ltd is a registered non-deposit lending institution based
            in Kigali. We provide personal loans to individuals across Rwanda — for
            the moments that matter, from school fees to growing a small business.
          </p>
          <p>
            Being a <strong className="text-[var(--color-ink)]">non-deposit</strong> lender
            means we don't take savings or deposits from the public. We focus on one
            thing: lending responsibly and treating every borrower with respect.
          </p>
          <p>
            Too many people meet hidden fees and confusing terms when they need help
            most. We decided to do it differently — clear costs, fair assessment, and
            a team that actually talks to you.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-3xl border border-[var(--color-line)] bg-white p-6">
              <h3 className="font-display text-lg font-bold text-[var(--color-ink)]">
                {v.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                {v.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-3xl bg-[var(--color-brand-wash)] p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Have a question first?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-[var(--color-ink-soft)]">
            We're happy to talk things through before you apply.
          </p>
          <Link
            href="/faq"
            className="mt-6 inline-block rounded-full border-2 border-[var(--color-brand)] px-7 py-2.5 font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-brand)] hover:text-white"
          >
            Read our FAQ
          </Link>
        </div>
      </section>
    </>
  );
}
