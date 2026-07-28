import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { listApplications } from "@/lib/applications";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

const statusTone = {
  new: "warning",
  reviewing: "neutral",
  approved: "success",
  rejected: "danger",
} as const;

const tabs = [
  { label: "All", value: "" },
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await verifySession();
  const { status } = await searchParams;
  const applications = await listApplications({ status });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `/admin/applications?status=${tab.value}` : "/admin/applications"}
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

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Loan type</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/applications/${app.id}`}
                    className="font-medium text-gray-900 hover:text-amber-700"
                  >
                    {app.fullName}
                  </Link>
                  <p className="text-gray-500">{app.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{app.loanType}</td>
                <td className="px-4 py-3 text-gray-700">{formatRWF(app.amountRequested)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(app.submittedAt)}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={app.status} tone={statusTone[app.status]} />
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
