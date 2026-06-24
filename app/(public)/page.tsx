import Link from "next/link";
import LoanCard from "@/components/LoanCard";
import Wave from "@/components/Wave";
import { loanProducts } from "@/lib/site";

const steps = [
  { title: "Apply in minutes", text: "Fill a short form online or visit our office in Kigali. No long paperwork." },
  { title: "We review fairly", text: "We check affordability openly and get back to you, usually within 24 hours." },
  { title: "Get your funds", text: "Approved loans go straight to your mobile money or bank, often the same day." },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-brand)] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-40 pt-20 md:grid-cols-2 md:pt-28">
          <div>
            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
              Registered non-deposit lender · Rwanda
            </span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.08] tracking-tight md:text-6xl">
              Money help that
              <br />
              <span className="text-[var(--color-accent-soft)]">treats you like a person.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/85">
              Cham Business lends to individuals across Rwanda — quickly, clearly,
              and kindly. No deposits, no hidden costs, no runaround.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/apply"
                className="rounded-full bg-[var(--color-accent)] px-7 py-3.5 font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)]"
              >
                Apply now
              </Link>
              <Link
                href="/loans"
                className="rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                See loan options
              </Link>
            </div>
          </div>

          <div className="flex items-end">
            <div className="grid w-full grid-cols-2 gap-4">
              {[
                { big: "24h", small: "Typical decision time" },
                { big: "RWF 20M", small: "Maximum loan amount" },
                { big: "0", small: "Hidden fees, ever" },
                { big: "100%", small: "Rwanda-based & registered" },
              ].map((f) => (
                <div key={f.small} className="rounded-3xl bg-white/12 p-5 backdrop-blur-sm">
                  <div className="font-display text-3xl font-extrabold text-[var(--color-accent-soft)]">
                    {f.big}
                  </div>
                  <div className="mt-1 text-sm text-white/75">{f.small}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Wave className="absolute bottom-0 left-0 w-full" />
      </section>

      {/* Loan products */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-extrabold text-[var(--color-ink)] md:text-4xl">
            Loans built around your life
          </h2>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            Whatever you need it for, we keep the terms clear and the process simple.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {loanProducts.map((loan) => (
            <LoanCard key={loan.slug} loan={loan} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--color-brand-wash)]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-extrabold text-[var(--color-ink)] md:text-4xl">
            Three simple steps
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-3xl bg-white p-7">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--color-accent)] font-display text-lg font-bold text-[var(--color-ink)]">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-[var(--color-ink)]">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="overflow-hidden rounded-[2rem] bg-[var(--color-brand)] px-8 py-14 text-center text-white md:px-16">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-4xl">
            Ready when you are. Apply in a few minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            A quick form is all it takes to get started. No obligation.
          </p>
          <Link
            href="/apply"
            className="mt-8 inline-block rounded-full bg-[var(--color-accent)] px-8 py-3.5 font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-accent-soft)]"
          >
            Start your application
          </Link>
        </div>
      </section>
    </>
  );
}
