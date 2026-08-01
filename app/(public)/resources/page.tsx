import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { resources } from "@/lib/resources";

export const metadata: Metadata = {
  title: "Guides & Resources",
  description:
    "Practical guides on getting a loan in Rwanda -- eligibility, documents, interest rates, and choosing the right loan product.",
  alternates: { canonical: "/resources" },
};

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Guides to borrowing well"
        subtitle="Plain-language answers to the questions we get asked most, so you can apply with confidence."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="space-y-6">
          {resources.map((r) => (
            <Link
              key={r.slug}
              href={`/resources/${r.slug}`}
              className="block rounded-3xl border border-[var(--color-line)] bg-white p-7 transition-colors hover:border-[var(--color-brand)]"
            >
              <p className="mb-2 text-xs text-[var(--color-ink-soft)]">
                {formatDate(r.publishedAt)} · {r.readingMinutes} min read
              </p>
              <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">{r.title}</h2>
              <p className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">{r.excerpt}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-[var(--color-brand)]">
                Read guide →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
