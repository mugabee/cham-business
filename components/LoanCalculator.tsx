"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { generateSchedule, monthlyPayment, totalInterest, totalRepayable } from "@/lib/loan-math";

const MIN_PRINCIPAL = 300_000;
const MAX_PRINCIPAL = 20_000_000;
const MIN_TERM = 1;
const MAX_TERM = 24;

function formatRWF(n: number): string {
  return `RWF ${Math.round(n).toLocaleString()}`;
}

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState(1_000_000);
  const [term, setTerm] = useState(4);
  const [showSchedule, setShowSchedule] = useState(false);

  const clampedPrincipal = Math.min(MAX_PRINCIPAL, Math.max(MIN_PRINCIPAL, principal || 0));
  const clampedTerm = Math.min(MAX_TERM, Math.max(MIN_TERM, term || 0));

  const { payment, interest, repayable, schedule } = useMemo(() => {
    const sched = generateSchedule(clampedPrincipal, clampedTerm, new Date());
    return {
      payment: monthlyPayment(clampedPrincipal, clampedTerm),
      interest: totalInterest(sched),
      repayable: totalRepayable(clampedPrincipal, sched),
      schedule: sched,
    };
  }, [clampedPrincipal, clampedTerm]);

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--color-line)] bg-white">
      <div className="border-b border-[var(--color-line)] px-7 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-soft)]">
          Try it yourself
        </p>
        <p className="mt-1 font-display text-lg font-bold text-[var(--color-ink)]">
          See your own monthly payment
        </p>
      </div>

      <div className="grid gap-6 px-7 py-6 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-ink)]">Loan amount (RWF)</span>
          <input
            type="number"
            min={MIN_PRINCIPAL}
            max={MAX_PRINCIPAL}
            step={50_000}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
          <input
            type="range"
            min={MIN_PRINCIPAL}
            max={MAX_PRINCIPAL}
            step={50_000}
            value={clampedPrincipal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-brand)]"
          />
          <span className="mt-1 block text-xs text-[var(--color-ink-soft)]">
            {formatRWF(MIN_PRINCIPAL)} – {formatRWF(MAX_PRINCIPAL)}
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[var(--color-ink)]">Repayment term (months)</span>
          <input
            type="number"
            min={MIN_TERM}
            max={MAX_TERM}
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="mt-2 w-full rounded-lg border border-[var(--color-line)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
          <input
            type="range"
            min={MIN_TERM}
            max={MAX_TERM}
            value={clampedTerm}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-brand)]"
          />
          <span className="mt-1 block text-xs text-[var(--color-ink-soft)]">
            {MIN_TERM} – {MAX_TERM} months, agreed with you before disbursement
          </span>
        </label>
      </div>

      <dl className="grid grid-cols-2 gap-0 divide-x divide-y divide-[var(--color-line)] border-t border-[var(--color-line)] md:grid-cols-4 md:divide-y-0">
        {[
          { label: "Loan amount", value: formatRWF(clampedPrincipal) },
          { label: "Monthly payment", value: formatRWF(payment) },
          { label: "Total interest", value: formatRWF(interest) },
          { label: "Total repayment", value: formatRWF(repayable), highlight: true },
        ].map((cell) => (
          <div key={cell.label} className="px-6 py-5">
            <dt className="text-xs text-[var(--color-ink-soft)]">{cell.label}</dt>
            <dd
              className={`mt-1 font-display text-xl font-bold ${
                cell.highlight ? "text-[var(--color-brand)]" : "text-[var(--color-ink)]"
              }`}
            >
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-[var(--color-line)] px-7 py-4">
        <button
          type="button"
          onClick={() => setShowSchedule((v) => !v)}
          className="text-sm font-semibold text-[var(--color-brand)] hover:underline"
        >
          {showSchedule ? "Hide" : "Show"} full repayment schedule
        </button>
      </div>

      {showSchedule && (
        <div className="overflow-x-auto border-t border-[var(--color-line)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-paper-deep)] text-left text-[var(--color-ink-soft)]">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Payment</th>
                <th className="px-4 py-2 font-medium">Principal</th>
                <th className="px-4 py-2 font-medium">Interest</th>
                <th className="px-4 py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-line)]">
              {schedule.map((row) => (
                <tr key={row.instalmentNumber}>
                  <td className="px-4 py-2 text-[var(--color-ink)]">{row.instalmentNumber}</td>
                  <td className="px-4 py-2 text-[var(--color-ink)]">{formatRWF(row.amountDue)}</td>
                  <td className="px-4 py-2 text-[var(--color-ink)]">{formatRWF(row.principalPortion)}</td>
                  <td className="px-4 py-2 text-[var(--color-ink)]">{formatRWF(row.interestPortion)}</td>
                  <td className="px-4 py-2 text-[var(--color-ink)]">{formatRWF(row.remainingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-[var(--color-line)] px-7 py-5 text-center">
        <p className="mb-3 text-xs text-[var(--color-ink-soft)]">
          This is an estimate. Your exact schedule is confirmed with you before you sign anything.
        </p>
        <Link
          href="/apply"
          className="inline-block rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)]"
        >
          Apply for this amount
        </Link>
      </div>
    </div>
  );
}
