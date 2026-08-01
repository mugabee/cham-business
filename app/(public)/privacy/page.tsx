import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { H2, P, Ul } from "@/components/ArticleProse";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Cham Business Ltd collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="What we collect, why, and how it's protected."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <P>
          Last updated: 1 August 2026. This policy explains how {company.name} ("we", "us")
          collects, uses, and protects personal data when you visit chambusiness.org, apply for a
          loan, or use your borrower account.
        </P>

        <H2>What we collect</H2>
        <Ul
          items={[
            "Application details: your name, phone number, email, loan type, requested amount, purpose, and monthly income.",
            "Verification documents (once your application is approved): national ID, proof of income, and, for business loans, additional business records.",
            "Loan and payment records: your repayment schedule, payments made, and any communications about your loan.",
            "Account access: a one-time code sent to your email to log in to your borrower portal -- we don't store passwords for borrowers.",
            "Basic website analytics (via Google Analytics): pages visited, approximate location, device and browser type. This is aggregated usage data, not tied to your loan application.",
          ]}
        />

        <H2>How we use it</H2>
        <Ul
          items={[
            "To assess and process your loan application.",
            "To administer your loan: schedules, payments, notices, and reminders.",
            "To verify your identity and prevent fraud.",
            "To meet our regulatory obligations as a licensed non-deposit lender.",
            "To understand how our website is used, so we can improve it.",
          ]}
        />

        <H2>How your data is protected</H2>
        <Ul
          items={[
            "National ID numbers are encrypted at rest -- not stored or displayed in plain text.",
            "Documents you upload are stored outside our website's public files and can only be accessed by authorized staff through a secure, logged-in system.",
            "Every staff action on your loan record is logged for accountability.",
            "Access to your account uses a one-time code sent only to your registered email -- there's no password to be stolen.",
          ]}
        />

        <H2>Who we share it with</H2>
        <P>
          We do not sell your personal data. We share it only where necessary: with regulatory
          authorities where legally required, with service providers strictly needed to operate
          (such as our email provider), or where you've asked us to act on your behalf (such as
          confirming your loan status to a guarantor you've named).
        </P>

        <H2>How long we keep it</H2>
        <P>
          We retain loan and financial records for as long as needed to service your loan and to
          meet our legal and regulatory record-keeping obligations, even after a loan is fully
          repaid or written off.
        </P>

        <H2>Your rights</H2>
        <P>
          You can ask us what personal data we hold about you, request a correction, or ask us to
          delete data we're not legally required to keep, by contacting us at{" "}
          <a href={`mailto:${company.email}`} className="text-[var(--color-brand)] hover:underline">
            {company.email}
          </a>
          . You can also raise any concern about how your data is handled through your borrower
          portal's complaints feature.
        </P>

        <H2>Cookies</H2>
        <P>
          We use essential cookies to keep you logged in to your account, and Google Analytics
          cookies to understand website usage. We don't use advertising or cross-site tracking
          cookies. You can control or block cookies through your browser settings.
        </P>

        <H2>Governing law</H2>
        <P>
          This policy is governed by the laws of Rwanda, including Law N° 058/2021 relating to
          the protection of personal data and privacy.
        </P>

        <H2>Contact</H2>
        <P>
          Questions about this policy: email{" "}
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
