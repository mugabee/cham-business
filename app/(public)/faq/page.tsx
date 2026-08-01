import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import FaqAccordion from "./FaqAccordion";
import { faqs } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about eligibility, approval time, fees, and repaying a Cham Business Ltd loan.",
  alternates: { canonical: "/faq" },
};

// See app/(public)/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageHeader
        eyebrow="FAQ"
        title="Questions, answered plainly"
        subtitle="If you don't see what you're looking for, just get in touch — we're happy to help."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <FaqAccordion />

        <div className="mt-12 text-center">
          <p className="text-[var(--color-ink-soft)]">Still have a question?</p>
          <Link
            href="/apply"
            className="mt-4 inline-block rounded-full bg-[var(--color-brand)] px-7 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)]"
          >
            Apply or get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
