import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listLoans } from "@/lib/loans";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

const statusTone = {
  active: "success",
  paid_off: "neutral",
  written_off: "danger",
} as const;

const tabs = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Paid off", value: "paid_off" },
  { label: "Written off", value: "written_off" },
];

export default async function LoansPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; archived?: string }>;
}) {
  await verifySession();
  const { status, archived } = await searchParams;
  const isArchived = archived === "1";
  const loans = await listLoans({ status, archived: isArchived });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">
          Loans {isArchived && <span className="text-base font-normal text-ink-soft">— Archived</span>}
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={
                (tab.value ? `/admin/loans?status=${tab.value}` : "/admin/loans") +
                (isArchived ? (tab.value ? "&archived=1" : "?archived=1") : "")
              }
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                (status ?? "") === tab.value
                  ? "bg-brand text-white"
                  : "bg-white text-ink-soft border border-line hover:bg-paper-deep"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <Link
          href={
            isArchived
              ? status
                ? `/admin/loans?status=${status}`
                : "/admin/loans"
              : status
                ? `/admin/loans?status=${status}&archived=1`
                : "/admin/loans?archived=1"
          }
          className="shrink-0 self-start rounded-full px-3 py-1.5 text-sm font-medium border border-dashed border-line text-ink-soft hover:bg-paper-deep"
        >
          {isArchived ? "← Back to active" : "Archived"}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-deep text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Borrower</th>
              <th className="px-4 py-3 font-medium">Principal</th>
              <th className="px-4 py-3 font-medium">Outstanding</th>
              <th className="px-4 py-3 font-medium">Disbursed</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-paper-deep">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/loans/${loan.id}`}
                    className="font-medium text-ink hover:text-brand-deep"
                  >
                    {loan.borrowerName}
                  </Link>
                  <p className="text-ink-soft">{loan.termMonths} months</p>
                </td>
                <td className="px-4 py-3 text-ink">{formatRWF(loan.principal)}</td>
                <td className="px-4 py-3 text-ink">{formatRWF(loan.outstanding)}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(loan.disbursedAt)}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <StatusBadge label={loan.status} tone={statusTone[loan.status]} />
                  {loan.isOverdue && <StatusBadge label="overdue" tone="danger" />}
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                  No loans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
