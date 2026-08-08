import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import JobApplicationForm from "@/components/JobApplicationForm";
import { getJobPostingBySlug, EMPLOYMENT_TYPE_LABELS } from "@/lib/jobs";
import { company } from "@/lib/site";

const SCHEMA_EMPLOYMENT_TYPE: Record<string, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posting = await getJobPostingBySlug(slug);
  if (!posting) return {};

  return {
    title: posting.title,
    description: posting.summary,
    alternates: { canonical: `/careers/${posting.slug}` },
  };
}

export const dynamic = "force-dynamic";

export default async function JobPostingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posting = await getJobPostingBySlug(slug);
  if (!posting || posting.status !== "open") notFound();

  const jobPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: posting.title,
    description: posting.description,
    datePosted: posting.createdAt.toISOString(),
    employmentType: SCHEMA_EMPLOYMENT_TYPE[posting.employmentType],
    hiringOrganization: {
      "@type": "Organization",
      name: company.name,
      sameAs: "https://chambusiness.org",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: posting.location,
        addressLocality: "Kigali",
        addressCountry: "RW",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <PageHeader
        eyebrow={[posting.department, EMPLOYMENT_TYPE_LABELS[posting.employmentType]].filter(Boolean).join(" · ")}
        title={posting.title}
        subtitle={posting.location}
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <Link href="/careers" className="text-sm text-[var(--color-brand)] hover:underline">
          ← Back to careers
        </Link>

        <div className="mt-6 space-y-6">
          <p className="text-lg text-[var(--color-ink-soft)]">{posting.summary}</p>

          <div>
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">About the role</h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--color-ink-soft)]">
              {posting.description}
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-[var(--color-ink)]">Requirements</h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[var(--color-ink-soft)]">
              {posting.requirements}
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-[var(--color-line)] bg-white p-8">
          <h2 className="font-display text-xl font-bold text-[var(--color-ink)] mb-6">Apply for this role</h2>
          <JobApplicationForm jobPostingId={posting.id} />
        </div>
      </section>
    </>
  );
}
