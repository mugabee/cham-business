import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "How It Works — Cham Business Ltd",
  description: "How to apply for and receive a loan from Cham Business Ltd in Rwanda.",
};

const steps = [
  {
    title: "Apply",
    text: "Complete a short application online, or visit our office in Kigali. You'll need a valid national ID, proof of income, and your mobile money or bank details.",
  },
  {
    title: "We assess",
    text: "We review your details and check that the repayments fit comfortably within your means. We aim to get back to you within 24 hours, and we'll explain our decision either way.",
  },
  {
    title: "You accept",
    text: "If approved, we show you the full terms — amount, instalments, total cost — in plain language. Nothing is hidden. You accept only if it works for you.",
  },
  {
    title: "Get funded",
    text: "Once you accept, funds are disbursed quickly, usually the same day, straight to your mobile money or bank account.",
  },
  {
    title: "Repay with ease",
    text: "Repay in steady instalments. We'll remind you ahead of each due date. If anything changes for you, talk to us early — we'd rather find a solution together.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="From application to funded, simply"
        subtitle="No jargon, no surprises. Here's exactly what to expect at each step."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <ol className="relative space-y-10 border-l-2 border-[var(--color-line)] pl-8">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[2.6rem] grid h-9 w-9 place-items-center rounded-full bg-[var(--color-brand)] font-display text-sm font-bold text-white">
                {i + 1}
              </span>
              <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">
                {s.title}
              </h2>
              <p className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">
                {s.text}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-14 rounded-3xl bg-[var(--color-brand-wash)] p-8 text-center">
          <h3 className="font-display text-2xl font-bold text-[var(--color-ink)]">
            Ready to start?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-[var(--color-ink-soft)]">
            The application takes just a few minutes, with no obligation.
          </p>
          <Link
            href="/apply"
            className="mt-6 inline-block rounded-full bg-[var(--color-brand)] px-7 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)]"
          >
            Apply now
          </Link>
        </div>
      </section>
    </>
  );
}
