import { verifySession } from "@/lib/dal";
import { getAccountingTotals, getLoanLedgerRows } from "@/lib/accounting";
import { formatRWF, formatDate } from "@/lib/format";

export default async function AccountingPage() {
  await verifySession();
  const [totals, ledger] = await Promise.all([
    getAccountingTotals(),
    getLoanLedgerRows(),
  ]);

  const cards = [
    { label: "Total disbursed", value: totals.disbursed },
    { label: "Total collected", value: totals.collected },
    { label: "Outstanding principal", value: totals.outstandingPrincipal },
    { label: "Interest earned", value: totals.interestEarned },
    { label: "Overdue amount", value: totals.overdueAmount },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Accounting</h1>
        <a
          href="/api/admin/accounting/export"
          className="rounded-lg bg-white border border-line hover:bg-paper-deep text-ink text-sm font-medium px-4 py-2 transition-colors"
        >
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-line p-4">
            <p className="text-xs text-ink-soft">{card.label}</p>
            <p className="text-lg font-semibold text-ink mt-1">{formatRWF(card.value)}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-ink mb-3">Loan ledger</h2>
      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Borrower</th>
              <th className="px-4 py-3 font-medium">Principal</th>
              <th className="px-4 py-3 font-medium">Disbursed</th>
              <th className="px-4 py-3 font-medium">Total due</th>
              <th className="px-4 py-3 font-medium">Paid</th>
              <th className="px-4 py-3 font-medium">Outstanding</th>
              <th className="px-4 py-3 font-medium">Overdue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ledger.map((row) => (
              <tr key={row.loanId} className="hover:bg-paper-deep">
                <td className="px-4 py-3 text-ink font-medium">{row.borrowerName}</td>
                <td className="px-4 py-3 text-ink">{formatRWF(row.principal)}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(row.disbursedAt)}</td>
                <td className="px-4 py-3 text-ink">{formatRWF(row.totalDue)}</td>
                <td className="px-4 py-3 text-ink">{formatRWF(row.totalPaid)}</td>
                <td className="px-4 py-3 text-ink">{formatRWF(row.outstanding)}</td>
                <td className="px-4 py-3 text-ink">
                  {row.overdue > 0 ? formatRWF(row.overdue) : "—"}
                </td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
                  No loans yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
