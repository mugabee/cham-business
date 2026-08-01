import type { Metadata } from "next";
import Link from "next/link";
import ArticleLayout from "@/components/ArticleLayout";
import { H2, P, Callout } from "@/components/ArticleProse";
import { getResourceBySlug } from "@/lib/resources";

const article = getResourceBySlug("5-signs-your-business-is-ready-for-a-loan")!;

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
      subtitle="Borrowing to grow a business works when the timing is right. Here's how to tell."
    >
      <P>
        This isn't financial advice for your specific situation — it's a description of the
        patterns we see most often in Business Loan applications that go smoothly, from
        approval through to easy repayment. Use it as a checklist against your own numbers.
      </P>

      <H2>1. You have steady, repeatable customer demand</H2>
      <P>
        Not a one-off spike — a pattern you can point to. Weekly sales figures, repeat
        customers, a season you can predict. Lenders (us included) look for demand that will
        still be there next month to support repayment.
      </P>

      <H2>2. There's a specific expense driving the ask</H2>
      <P>
        "Grow the business" is a goal, not a plan. "Restock before the December rush" or "buy a
        second freezer to handle the orders we're already turning away" is specific enough to
        size a loan against and specific enough for us to assess quickly.
      </P>

      <H2>3. Your current cash flow can carry the repayment</H2>
      <P>
        The loan should fund growth, not fill a gap your existing income already can't cover.
        If your business is currently break-even or worse, a loan adds a fixed monthly
        obligation on top of a problem it didn't cause — worth fixing the underlying gap first.
      </P>

      <H2>4. You can show your numbers</H2>
      <P>
        Sales records, an RRA clearance certificate, a rent agreement for your business
        location — the paperwork exists because it's exactly what tells us (and honestly, you)
        whether the business can absorb the repayment.
      </P>

      <H2>5. You have people who can vouch for you</H2>
      <P>
        Part of our business loan process involves sponsor letters from other business owners
        in your area who know you and your operation. If you can think of two people who'd say
        yes without hesitation, that's a good sign in itself.
      </P>

      <Callout>
        If most of these are true right now, the timing is probably right. If two or three
        aren't, that's not a rejection — it's useful information about what to shore up before
        you apply, so the loan does what it's meant to do.
      </Callout>

      <P>
        See what a Business Loan looks like for your numbers on the{" "}
        <Link href="/loans" className="text-[var(--color-brand)] hover:underline">
          Loans page
        </Link>
        , including the documents you'll need, listed in detail{" "}
        <Link
          href="/resources/documents-needed-to-apply-for-a-loan-in-rwanda"
          className="text-[var(--color-brand)] hover:underline"
        >
          here
        </Link>
        .
      </P>
    </ArticleLayout>
  );
}
