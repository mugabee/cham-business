import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getDashboardStats } from "@/lib/dashboard";
import { formatRWF } from "@/lib/format";
import StatCard from "@/components/admin/StatCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await verifySession();
  const stats = await getDashboardStats();

  const attention = [
    stats.pendingApplicationsCount > 0 && {
      href: "/admin/applications?status=new",
      text: `${stats.pendingApplicationsCount} application${stats.pendingApplicationsCount === 1 ? "" : "s"} waiting for review`,
    },
    stats.pendingPaymentProofsCount > 0 && {
      href: "/admin/payment-proofs",
      text: `${stats.pendingPaymentProofsCount} payment proof${stats.pendingPaymentProofsCount === 1 ? "" : "s"} awaiting confirmation`,
    },
    stats.overdueLoansCount > 0 && {
      href: "/admin/loans?status=active",
      text: `${stats.overdueLoansCount} loan${stats.overdueLoansCount === 1 ? "" : "s"} overdue on a payment`,
    },
  ].filter(Boolean) as { href: string; text: string }[];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">
        Welcome back{session.fullName ? `, ${session.fullName}` : ""}
      </h1>
      <p className="text-ink-soft mb-6">Here&apos;s what&apos;s happening across the business today.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Applications to review"
          value={stats.pendingApplicationsCount}
          href="/admin/applications?status=new"
          tone={stats.pendingApplicationsCount > 0 ? "warning" : "neutral"}
        />
        <StatCard
          label="Active loans"
          value={stats.activeLoansCount}
          href="/admin/loans?status=active"
        />
        <StatCard
          label="Outstanding principal"
          value={formatRWF(stats.totalOutstanding)}
          href="/admin/accounting"
        />
        <StatCard
          label="Payment proofs pending"
          value={stats.pendingPaymentProofsCount}
          href="/admin/payment-proofs"
          tone={stats.pendingPaymentProofsCount > 0 ? "warning" : "neutral"}
        />
      </div>

      <div className="bg-white rounded-2xl border border-line p-5">
        <h2 className="font-semibold text-ink mb-3">Needs your attention</h2>
        {attention.length === 0 ? (
          <p className="text-sm text-ink-soft">Nothing urgent right now — everything is caught up.</p>
        ) : (
          <ul className="divide-y divide-line">
            {attention.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between py-3 text-sm text-ink hover:text-brand transition-colors"
                >
                  <span>{item.text}</span>
                  <span className="text-brand font-medium">Review →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
