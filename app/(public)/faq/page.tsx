import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import FaqAccordion from "./FaqAccordion";

// See app/(public)/page.tsx for why this is forced dynamic.
export const dynamic = "force-dynamic";

export default function FaqPage() {
  return (
    <>
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
