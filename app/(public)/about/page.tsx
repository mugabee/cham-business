import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Cham Business Ltd, a registered non-deposit lender serving individuals across Rwanda.",
  alternates: { canonical: "/about" },
};

// See app/(public)/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="About Cham Business Ltd"
        subtitle="A non-deposit lender based in Kicukiro, Kigali."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="prose-custom space-y-5 text-lg leading-relaxed text-[var(--color-ink-soft)]">
          <p>
            Cham Business Ltd is a registered non-deposit lending institution based
            in Kigali. We provide personal loans to individuals across Rwanda, for
            things like school fees, medical costs, or growing a small business.
          </p>
          <p>
            Being a <strong className="text-[var(--color-ink)]">non-deposit</strong> lender
            means we don't take savings or deposits from the public. We only lend.
          </p>
          <p>
            We publish the full cost of every loan before you sign, and each application
            is assessed on its own numbers, not a fixed formula.
          </p>
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
