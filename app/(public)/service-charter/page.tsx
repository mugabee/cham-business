import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { company } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service Charter",
  description: "Clear timelines for what you can expect from Cham Business Ltd -- loan decisions, complaint responses, and more.",
  alternates: { canonical: "/service-charter" },
};

export const dynamic = "force-dynamic";

const commitments = [
  { item: "Loan decision (approve or reject)", timeline: "Within 2 working days of a complete application" },
  { item: "Reason for a rejected application", timeline: "Included in the same notification" },
  { item: "Payment or transaction confirmation", timeline: "Immediately on our system, by email if you've provided one" },
  { item: "Response to a complaint", timeline: "Acknowledged promptly; resolved or updated within a reasonable time" },
  { item: "Collateral deregistration after full repayment", timeline: "Within 15 days, free of charge" },
  { item: "Guarantor notified of full repayment", timeline: "Within 15 days" },
  { item: "Cooling-off cancellation window", timeline: "Up to 30 days after approval, before any repayments are made, free of charge" },
];

export default function ServiceCharterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Service charter"
        title="What you can expect from us"
        subtitle="Clear timelines for the things that matter most, so you always know where you stand."
      />

      <section className="mx-auto max-w-3xl px-5 py-16">
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-paper-deep)] text-left text-[var(--color-ink-soft)]">
              <tr>
                <th className="px-5 py-3 font-medium">Commitment</th>
                <th className="px-5 py-3 font-medium">Timeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {commitments.map((c) => (
                <tr key={c.item}>
                  <td className="px-5 py-3 text-[var(--color-ink)]">{c.item}</td>
                  <td className="px-5 py-3 text-[var(--color-ink-soft)]">{c.timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 space-y-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          <p>
            We treat every customer fairly and without discrimination, and we never charge fees that
            aren&apos;t disclosed to you upfront. If we don&apos;t meet one of these commitments, or
            anything about our service falls short, tell us — use the complaints option in your
            borrower portal, or contact us directly.
          </p>
          <p>
            Email <a href={`mailto:${company.email}`} className="text-[var(--color-brand)] hover:underline">{company.email}</a> or
            call <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="text-[var(--color-brand)] hover:underline">{company.phone}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
