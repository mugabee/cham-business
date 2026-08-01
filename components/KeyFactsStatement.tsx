import { formatRWF } from "@/lib/format";

/**
 * BNR Reg 55/2022 Article 49: a key facts statement must accompany the
 * repayment schedule so the consumer can see, in one place, the rights
 * that matter most -- not just the numbers already shown elsewhere on the
 * page.
 */
export default function KeyFactsStatement({
  principal,
  interestRateMonthly,
  termMonths,
  totalRepayable,
}: {
  principal: number;
  interestRateMonthly: number;
  termMonths: number;
  totalRepayable: number;
}) {
  return (
    <div className="bg-paper-deep rounded-2xl border border-line p-5 text-sm">
      <h2 className="font-semibold text-ink mb-3">Key facts statement</h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <dt className="text-ink-soft">Principal</dt>
          <dd className="text-ink font-medium">{formatRWF(principal)}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Interest rate</dt>
          <dd className="text-ink font-medium">{(interestRateMonthly * 100).toFixed(2)}% / month, reducing balance</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Term</dt>
          <dd className="text-ink font-medium">{termMonths} months</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Total repayable</dt>
          <dd className="text-ink font-medium">{formatRWF(totalRepayable)}</dd>
        </div>
      </dl>
      <ul className="space-y-1.5 text-ink-soft list-disc list-inside">
        <li>No fee for repaying early — only interest/penalties accrued up to that date apply.</li>
        <li>You may cancel free of charge within 30 days of approval, as long as no repayments have been made.</li>
        <li>Penalties for late payment are charged only on overdue principal and are capped at your outstanding principal balance.</li>
        <li>Not satisfied with how your loan is being handled? Contact us or file a complaint — see the Complaints page.</li>
      </ul>
    </div>
  );
}
