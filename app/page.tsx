import Link from "next/link";
import LoanCard from "@/components/LoanCard";

const loans = [
  {
    name: "Salary Advance",
    blurb: "Bridge the gap before payday with a short-term advance against your monthly salary.",
    range: "RWF 50K – 1M",
    term: "1 – 3 months",
  },
  {
    name: "Personal Loan",
    blurb: "Flexible funds for school fees, medical costs, or family needs, repaid in steady instalments.",
    range: "RWF 200K – 5M",
    term: "3 – 24 months",
  },
  {
    name: "Business Boost",
    blurb: "Working capital for individual traders and small businesses ready to grow stock or operations.",
    range: "RWF 500K – 10M",
    term: "6 – 36 months",
  },
];

const steps = [
  { n: "01", title: "Apply", text: "Fill a short form online or visit our office in Kigali. It takes a few minutes." },
  { n: "02", title: "Get assessed", text: "We review your details and check affordability — fairly and transparently." },
  { n: "03", title: "Receive funds", text: "Approved loans are disbursed quickly, straight to your mobile money or bank." },
];

export default function Home() {
  return (
    <>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-[var(--color-forest)] text-[var(--color-cream)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-44 pt-20 md:grid-cols-2 md:pt-28">
          <div>
            <span className="inline-block rounded-full border border-[var(--color-gold)]/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-gold-soft)]">
              Registered non-deposit lender · Rwanda
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Fair loans for
              <br />
              <span className="text-[var(--color-gold-soft)]">real people.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--color-cream)]/80">
              Cham Business Ltd lends to individuals across Rwanda — quickly,
              transparently, and without the runaround. No deposits, no hidden
              costs.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/apply"
                className="rounded-full bg-[var(--color-gold)] px-7 py-3.5 font-semibold text-[var(--color-forest-deep)] transition-colors hover:bg-[var(--color-gold-soft)]"
              >
                Apply now
              </Link>
              <Link
                href="/loans"
                className="rounded-full border border-[var(--color-cream)]/30 px-7 py-3.5 font-semibold text-[var(--color-cream)] transition-colors hover:bg-[var(--color-cream)]/10"
              >
                See loan options
              </Link>
            </div>
          </div>

          {/* Quick trust facts */}
          <div className="flex items-end">
            <div className="grid w-full grid-cols-2 gap-4">
              {[
                { big: "24h", small: "Typical decision time" },
                { big: "RWF 10M", small: "Maximum loan amount" },
                { big: "0", small: "Hidden fees, ever" },
                { big: "100%", small: "Rwanda-based & registered" },
              ].map((f) => (
                <div
                  key={f.small}
                  className="rounded-2xl border border-[var(--color-cream)]/15 bg-[var(--color-forest-soft)]/40 p-5"
                >
                  <div className="font-display text-3xl font-semibold text-[var(--color-gold-soft)]">
                    {f.big}
                  </div>
                  <div className="mt-1 text-sm text-[var(--color-cream)]/70">
                    {f.small}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signature: layered hills */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 90c240-70 480-70 720 0s480 70 720 0v70H0V90Z" fill="var(--color-forest-soft)" opacity="0.5" />
          <path d="M0 120c280-50 520-30 760 10s460 30 680-20v50H0v-40Z" fill="var(--color-cream)" />
        </svg>
      </section>

      {/* ===== Loan products ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-forest)] md:text-4xl">
            Loans built around your life
          </h2>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            Whatever you need it for, we keep the terms clear and the process
            simple.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {loans.map((loan) => (
            <LoanCard key={loan.name} {...loan} />
          ))}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="bg-[var(--color-cream-deep)]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-forest)] md:text-4xl">
            Three steps to funded
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="font-display text-5xl font-semibold text-[var(--color-gold)]">
                  {s.n}
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-[var(--color-forest)]">
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

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="rounded-3xl bg-[var(--color-forest)] px-8 py-14 text-center text-[var(--color-cream)] md:px-16">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight md:text-4xl">
            Ready when you are. Apply in a few minutes.
          </h2>
          <Link
            href="/apply"
            className="mt-8 inline-block rounded-full bg-[var(--color-gold)] px-8 py-3.5 font-semibold text-[var(--color-forest-deep)] transition-colors hover:bg-[var(--color-gold-soft)]"
          >
            Start your application
          </Link>
        </div>
      </section>
    </>
  );
}
