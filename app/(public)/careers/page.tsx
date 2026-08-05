import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { listOpenJobPostings, EMPLOYMENT_TYPE_LABELS } from "@/lib/jobs";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open positions at Cham Business Ltd, a licensed non-deposit lender in Kigali, Rwanda.",
  alternates: { canonical: "/careers" },
};

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const postings = await listOpenJobPostings();

  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Join our team"
        subtitle="We're a small, growing lender in Kigali. Here's what we're currently hiring for."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        {postings.length === 0 && (
          <p className="rounded-2xl border border-[var(--color-line)] bg-white p-8 text-center text-[var(--color-ink-soft)]">
            We don't have any open positions right now, but check back soon -- or reach out via{" "}
            <Link href="/about" className="text-[var(--color-brand)] hover:underline">
              our contact details
            </Link>
            .
          </p>
        )}

        <div className="space-y-4">
          {postings.map((posting) => (
            <Link
              key={posting.id}
              href={`/careers/${posting.slug}`}
              className="block rounded-2xl border border-[var(--color-line)] bg-white p-6 transition-colors hover:border-[var(--color-brand)]"
            >
              <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">{posting.title}</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                {[posting.department, posting.location, EMPLOYMENT_TYPE_LABELS[posting.employmentType]]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-3 text-[var(--color-ink-soft)]">{posting.summary}</p>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-[var(--color-ink-soft)]">
          {company.equalOpportunityStatement}
        </p>
      </section>
    </>
  );
}
