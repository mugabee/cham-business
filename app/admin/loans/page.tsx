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
        <h1 className="text-2xl font-semibold text-gray-900">
          Loans {isArchived && <span className="text-base font-normal text-gray-400">— Archived</span>}
        </h1>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={
                (tab.value ? `/admin/loans?status=${tab.value}` : "/admin/loans") +
                (isArchived ? (tab.value ? "&archived=1" : "?archived=1") : "")
              }
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                (status ?? "") === tab.value
                  ? "bg-amber-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
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
          className="rounded-full px-3 py-1.5 text-sm font-medium border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          {isArchived ? "← Back to active" : "Archived"}
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Borrower</th>
              <th className="px-4 py-3 font-medium">Principal</th>
              <th className="px-4 py-3 font-medium">Outstanding</th>
              <th className="px-4 py-3 font-medium">Disbursed</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loans.map((loan) => (
              <tr key={loan.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/loans/${loan.id}`}
                    className="font-medium text-gray-900 hover:text-amber-700"
                  >
                    {loan.borrowerName}
                  </Link>
                  <p className="text-gray-500">{loan.termMonths} months</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(loan.principal)}</td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(loan.outstanding)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(loan.disbursedAt)}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <StatusBadge label={loan.status} tone={statusTone[loan.status]} />
                  {loan.isOverdue && <StatusBadge label="overdue" tone="danger" />}
                </td>
              </tr>
            ))}
            {loans.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
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
