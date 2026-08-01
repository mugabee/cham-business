import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { company } from "@/lib/site";
import type { ResourceArticle } from "@/lib/resources";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticleLayout({
  article,
  subtitle,
  children,
}: {
  article: ResourceArticle;
  subtitle: string;
  children: React.ReactNode;
}) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { "@type": "Organization", name: company.name },
    publisher: { "@type": "Organization", name: company.name },
    mainEntityOfPage: `https://chambusiness.org/resources/${article.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <PageHeader eyebrow="Resources" title={article.title} subtitle={subtitle} />

      <article className="mx-auto max-w-3xl px-5 py-16">
        <p className="mb-10 text-sm text-[var(--color-ink-soft)]">
          {formatDate(article.publishedAt)} · {article.readingMinutes} min read
        </p>

        {children}

        <div className="mt-16 flex flex-col items-center gap-4 border-t border-[var(--color-line)] pt-10 text-center">
          <p className="text-[var(--color-ink-soft)]">Ready to see what you'd qualify for?</p>
          <Link
            href="/apply"
            className="inline-block rounded-full bg-[var(--color-brand)] px-7 py-3 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)]"
          >
            Apply now
          </Link>
          <Link href="/resources" className="text-sm text-[var(--color-brand)] hover:underline">
            ← Back to all guides
          </Link>
        </div>
      </article>
    </>
  );
}
