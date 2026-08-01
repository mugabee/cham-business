import PageHeader from "@/components/PageHeader";
import { company, loanTerms } from "@/lib/site";

export const dynamic = "force-dynamic";

const clauses = [
  {
    title: "1. The loan",
    body: "The lender agrees to provide the borrower a loan of the principal amount, at the interest rate, and over the term stated in the borrower's individual loan agreement and repayment schedule, both provided before signature and again after signature.",
  },
  {
    title: "2. Interest",
    body: `Interest is charged at ${loanTerms.rate}. Interest is calculated only on the outstanding principal, and no interest is charged twice on the same amount.`,
  },
  {
    title: "3. Repayment",
    body: "The borrower repays according to the schedule provided at signature. Early repayment is allowed at any time with no penalty — only interest and any lawfully assessed penalties accrued up to the repayment date apply.",
  },
  {
    title: "4. Penalties and the in duplum rule",
    body: "Penalties for late payment, where charged, are calculated only on the overdue principal amount, never on accrued interest or other penalties. In no case will the total penalties charged on a loan exceed the loan's outstanding principal balance.",
  },
  {
    title: "5. Cooling-off period",
    body: "The borrower may cancel this agreement free of charge within 30 days of approval, provided no repayments have yet been made.",
  },
  {
    title: "6. Collateral (where applicable)",
    body: "Any collateral pledged against this loan will be registered and, on full repayment, deregistered by the lender at no cost to the borrower, normally within 15 days of settlement.",
  },
  {
    title: "7. Guarantors (where applicable)",
    body: "Any guarantor signs a separate guarantee agreement stating their rights and obligations, and will be notified in writing within 15 days once the loan is fully repaid.",
  },
  {
    title: "8. Fair treatment",
    body: "The lender will not discriminate, harass, or use unfair debt-recovery practices. Recovery of any overdue amount follows amicable engagement first; foreclosure or asset recovery is a last resort.",
  },
  {
    title: "9. Complaints",
    body: `Borrowers may raise a complaint at any time through the borrower portal or by contacting ${company.email}. Every complaint is reviewed and responded to.`,
  },
  {
    title: "10. Changes to terms",
    body: "Any change to fees, pricing, or product terms will be communicated to the borrower at least 30 days before it takes effect.",
  },
];

export default function ContractTemplatePage() {
  return (
    <>
      <PageHeader
        eyebrow="Standard contract"
        title="Our standard loan agreement terms"
        subtitle="Every loan agreement we issue is built on these terms. Your individual agreement adds the specific amount, rate, and schedule agreed with you."
      />

      <section className="mx-auto max-w-3xl px-5 py-16 space-y-8">
        {clauses.map((c) => (
          <div key={c.title}>
            <h2 className="font-display text-lg font-semibold text-[var(--color-ink)] mb-2">{c.title}</h2>
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{c.body}</p>
          </div>
        ))}

        <p className="text-xs text-[var(--color-ink-soft)] pt-4 border-t border-[var(--color-line)]">
          This page is a summary for information only — it is not a substitute for the signed loan
          agreement you receive when you apply, which takes precedence.
        </p>
      </section>
    </>
  );
}
