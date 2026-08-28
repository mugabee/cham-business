import type { Metadata } from "next";
import ArticleLayout from "@/components/ArticleLayout";
import { H2, P, Ul, Callout, CompareTable } from "@/components/ArticleProse";
import { getResourceBySlug } from "@/lib/resources";

const article = getResourceBySlug("salary-loan-vs-emergency-loan")!;

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
      subtitle="A salary loan bridges a predictable gap before payday. An emergency loan covers an unplanned expense right now."
    >
      <P>
        Take a Salary Loan if you know the shortfall is coming, on a date you can name. Take an
        Emergency Loan if something already happened and you need funds today. Both carry the
        same 5% monthly reducing-balance rate and pay out to your mobile money or bank account.
      </P>

      <CompareTable
        columns={["", "Salary Loan", "Emergency Loan"]}
        rows={[
          ["Best for", "A predictable, recurring gap before payday", "An unplanned, urgent expense"],
          ["Typical trigger", "Salary timing doesn't match your bills", "Medical bill, urgent repair, family crisis"],
          ["Who it suits", "Anyone with regular, verifiable income", "Anyone facing a sudden expense"],
          ["Paperwork", "ID + income verification", "Kept minimal, decision prioritized for speed"],
        ]}
      />

      <H2>When a Salary Loan fits</H2>
      <P>
        If your bills or obligations regularly fall in an awkward spot relative to your pay
        date, a Salary Loan bridges that gap on a schedule you can predict every month. It's
        built for civil servants, private-sector employees, and anyone else with a steady,
        verifiable income — not for one-off emergencies.
      </P>
      <Ul
        items={[
          "Rent or school fees due before your next paycheck lands",
          "A recurring monthly shortfall you can see coming",
          "You want repayment structured around your known salary date",
        ]}
      />

      <H2>When an Emergency Loan fits</H2>
      <P>
        This one exists for the expense you didn't see coming. We keep the paperwork to a
        minimum and prioritize speed of decision, because the whole point is getting funds to
        you before the situation gets worse.
      </P>
      <Ul
        items={[
          "A medical bill that can't wait",
          "An urgent repair (roof, vehicle, equipment you depend on)",
          "A family situation that needs money now, not next week",
        ]}
      />

      <Callout>
        Rule of thumb: if you can predict it happening again next month, it's a Salary Loan
        situation. If it caught you off guard, it's an Emergency Loan situation.
      </Callout>

      <H2>Can you use either one for something else?</H2>
      <P>
        The categories help us understand your situation and get you the right terms, but
        they're not rigid boxes — if you're not sure which fits, apply and tell us what's going
        on in the purpose field. We'll guide you to the right product during review rather than
        rejecting a mismatched label.
      </P>
    </ArticleLayout>
  );
}
