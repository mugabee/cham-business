import type { Metadata } from "next";
import Link from "next/link";
import ArticleLayout from "@/components/ArticleLayout";
import { H2, P, Ul, Callout } from "@/components/ArticleProse";
import { getResourceBySlug } from "@/lib/resources";

const article = getResourceBySlug("how-to-get-a-personal-loan-fast-in-rwanda")!;

export const metadata: Metadata = {
  title: article.title,
  description: article.excerpt,
  alternates: { canonical: `/resources/${article.slug}` },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <ArticleLayout
      article={article}
      subtitle="What actually makes a loan application fast or slow, and how to put yourself in the first group."
    >
      <P>
        "Fast" gets thrown around a lot in lending. Here's what it actually means at Cham
        Business: most applications get a decision within 24 hours, and our{" "}
        <Link href="/service-charter" className="text-[var(--color-brand)] hover:underline">
          service charter
        </Link>{" "}
        commits to a decision within 2 working days at the latest, on any complete application.
        The gap between "usually next-day" and "guaranteed within 2 days" is exactly what this
        guide is about — the difference is almost always in how complete your application is
        when you submit it.
      </P>

      <H2>The four things that speed up your approval</H2>
      <Ul
        items={[
          <>
            <strong className="text-[var(--color-ink)]">Income proof that matches what you declare.</strong>{" "}
            A payslip, bank statement, or business record that supports the monthly income you
            enter on the form — mismatches are the single most common reason a review takes
            longer.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">A valid national ID.</strong> Expired or
            hard-to-read ID scans get sent back for reconfirmation, which resets the clock.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">A realistic amount.</strong> We size
            every loan to what you can comfortably repay against your income. Asking for an
            amount clearly out of proportion to your declared income triggers a closer look.
          </>,
          <>
            <strong className="text-[var(--color-ink)]">A clear stated purpose.</strong> "Business
            stock" or "medical expense" tells us which product and terms actually fit you —
            vague answers slow down matching you to the right loan type.
          </>,
        ]}
      />

      <Callout>
        The fastest applications are complete applications. Everything below the basic form —
        occupation, address, supporting documents — gets collected once you're approved, through
        your own borrower account, so the upfront form itself stays short.
      </Callout>

      <H2>What happens after you apply</H2>
      <P>
        Once you submit, you'll get an email confirming what we received. If your application is
        approved, you're notified immediately with next steps; if it's declined, you get a clear
        reason and, where relevant, guidance on reapplying — we don't leave you guessing either
        way. After approval, you finish your remaining details and documents through your own
        secure account, verified by a one-time code sent to your email — no password to create or
        remember.
      </P>

      <H2>The one thing that slows everyone down</H2>
      <P>
        Incomplete documentation. Not fraud, not bad credit — just a missing payslip or an ID
        photo that's too blurry to read. If you have your ID and one clear proof of income ready
        before you start, you've already cleared the biggest hurdle.
      </P>
    </ArticleLayout>
  );
}
