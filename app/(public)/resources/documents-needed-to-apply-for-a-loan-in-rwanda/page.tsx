import type { Metadata } from "next";
import Link from "next/link";
import ArticleLayout from "@/components/ArticleLayout";
import { H2, P, Ul, Callout } from "@/components/ArticleProse";
import { getResourceBySlug } from "@/lib/resources";
import { calculateApplicationFee } from "@/lib/documents";

const article = getResourceBySlug("documents-needed-to-apply-for-a-loan-in-rwanda")!;

export const metadata: Metadata = {
  title: article.title,
  description: article.excerpt,
  alternates: { canonical: `/resources/${article.slug}` },
};

export const dynamic = "force-dynamic";

const exampleFee = calculateApplicationFee(1_000_000);

export default function Page() {
  return (
    <ArticleLayout
      article={article}
      subtitle="The exact list, for personal and business loans, plus the one fee that's calculated upfront -- no surprises."
    >
      <P>
        The public application form only asks for the basics — name, phone, email, loan type,
        amount, and income. Everything below is what you'll complete afterward, once you're
        approved, through your own account. Knowing it upfront means you're not caught off guard
        partway through.
      </P>

      <H2>For every loan</H2>
      <Ul
        items={[
          "A valid national ID (and your spouse's ID, if you're married)",
          "A bank statement showing your income activity",
          "A mobile money (MTN or Airtel) statement history",
          "Your marital status certificate, if you're married or divorced",
          "Your occupation and work/home address",
        ]}
      />

      <H2>If you're applying for a Business Loan</H2>
      <P>Business loans carry a few additional requirements, since we're assessing a business's operating history alongside your personal income:</P>
      <Ul
        items={[
          "A Rwanda Revenue Authority (RRA) clearance certificate",
          "A 6-month rent agreement for your business location",
          "Two sponsor letters from neighboring business owners who can confirm they know you",
          "An itemized list of what the loan will actually fund",
          "A collateral valuation or expert appraisal, if you're offering collateral (optional, but it can support a larger amount)",
        ]}
      />

      <H2>The one fee, calculated upfront</H2>
      <P>
        There's a single origination fee: 1% of your requested loan amount plus 18% VAT on that
        fee, with a floor of RWF 30,000 for smaller loans. On a RWF 1,000,000 loan, that works
        out to <strong className="text-[var(--color-ink)]">{`RWF ${exampleFee.toLocaleString()}`}</strong>. You
        see this number on the application form itself, before you submit — it's never a
        surprise added later.
      </P>

      <Callout>
        No other fees exist outside your interest and this one origination fee. If someone asks
        you to pay anything else to "process" or "release" a Cham Business loan, it isn't us —
        contact us directly to check.
      </Callout>

      <H2>What slows an application down</H2>
      <P>
        Almost always the same thing: a document that doesn't match what's declared elsewhere —
        a bank statement under a different name, an ID that's expired, income figures that don't
        line up. Have everything above ready and matching before you start your application, and
        there's nothing left to hold it up.
      </P>
      <P>
        Ready to start?{" "}
        <Link href="/apply" className="text-[var(--color-brand)] hover:underline">
          Apply here
        </Link>
        .
      </P>
    </ArticleLayout>
  );
}
