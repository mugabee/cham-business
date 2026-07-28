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
        <h1 className="text-2xl font-semibold text-gray-900">Accounting</h1>
        <a
          href="/api/admin/accounting/export"
          className="rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 transition-colors"
        >
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{card.label}</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{formatRWF(card.value)}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Loan ledger</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
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
          <tbody className="divide-y divide-gray-100">
            {ledger.map((row) => (
              <tr key={row.loanId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{row.borrowerName}</td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(row.principal)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(row.disbursedAt)}</td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(row.totalDue)}</td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(row.totalPaid)}</td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(row.outstanding)}</td>
                <td className="px-4 py-3 text-gray-700">
                  {row.overdue > 0 ? formatRWF(row.overdue) : "—"}
                </td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
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
