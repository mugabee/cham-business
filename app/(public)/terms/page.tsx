import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { H2, P, Ul } from "@/components/ArticleProse";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of chambusiness.org and our loan services.",
  alternates: { canonical: "/terms" },
};

export const dynamic = "force-dynamic";

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The terms that govern your use of this website and our loan services."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <P>
          Last updated: 1 August 2026. These terms apply when you use chambusiness.org, submit a
          loan application, or use your borrower portal account. By using the website or
          submitting an application, you agree to them.
        </P>

        <H2>Who can use our services</H2>
        <P>
          You must be at least 18 years old and a resident of Rwanda with a verifiable source of
          income to apply for a loan. Information you submit must be accurate and truthful --
          providing false information may result in your application being rejected or, for an
          existing loan, being called in for immediate repayment.
        </P>

        <H2>Applications are not guaranteed approval</H2>
        <P>
          Submitting an application does not guarantee a loan. Every application is assessed
          individually, including an affordability check, before a decision is made. We'll notify
          you of the outcome and, where approved, provide the loan amount, interest rate, and
          repayment schedule for your review before you sign anything.
        </P>

        <H2>Your loan agreement</H2>
        <P>
          If approved, the specific terms of your loan -- principal, interest rate, term, and
          repayment schedule -- are set out in your individual loan agreement, which takes
          precedence over the general descriptions on this website. Our{" "}
          <a href="/contract-template" className="text-[var(--color-brand)] hover:underline">
            standard contract terms
          </a>{" "}
          and{" "}
          <a href="/service-charter" className="text-[var(--color-brand)] hover:underline">
            service charter
          </a>{" "}
          describe the terms every loan agreement is built on.
        </P>

        <H2>Your borrower portal account</H2>
        <Ul
          items={[
            "Access to your portal account is by one-time code sent to your registered email -- keep your email account secure, since anyone with access to it can request a login code.",
            "You're responsible for the accuracy of information and documents you submit through your account.",
            "We may suspend account access if we suspect fraud or unauthorized use.",
          ]}
        />

        <H2>Acceptable use of the website</H2>
        <P>
          You agree not to use this website to submit fraudulent information, attempt to gain
          unauthorized access to any account or system, or interfere with the site's normal
          operation.
        </P>

        <H2>Intellectual property</H2>
        <P>
          The content on this website -- text, design, and branding -- belongs to{" "}
          {company.name} unless otherwise stated, and may not be copied or reused without
          permission.
        </P>

        <H2>No financial advice</H2>
        <P>
          Nothing on this website constitutes financial or investment advice. Loan calculators
          and illustrations are estimates to help you understand repayment, not a substitute for
          the exact figures in your individual loan agreement.
        </P>

        <H2>Limitation of liability</H2>
        <P>
          We aim to keep this website accurate and available, but we don't guarantee it will be
          error-free or uninterrupted, and we're not liable for losses arising from reliance on
          general website content rather than your individual loan agreement.
        </P>

        <H2>Changes to these terms</H2>
        <P>
          We may update these terms from time to time. Continued use of the website after a
          change means you accept the updated terms. This page always reflects the current
          version.
        </P>

        <H2>Governing law</H2>
        <P>These terms are governed by the laws of Rwanda.</P>

        <H2>Contact</H2>
        <P>
          Questions about these terms: email{" "}
          <a href={`mailto:${company.email}`} className="text-[var(--color-brand)] hover:underline">
            {company.email}
          </a>{" "}
          or call{" "}
          <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="text-[var(--color-brand)] hover:underline">
            {company.phone}
          </a>
          .
        </P>
      </section>
    </>
  );
}
