import Link from "next/link";
import { formatRWF } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";

const statusTone = {
  active: "success",
  paid_off: "neutral",
  written_off: "danger",
} as const;

export default function LoanProgressCard({
  loan,
}: {
  loan: {
    id: number;
    principal: number;
    outstanding: number;
    totalDue: number;
    status: "active" | "paid_off" | "written_off";
    isOverdue: boolean;
  };
}) {
  const paid = Math.max(loan.totalDue - loan.outstanding, 0);
  const percent = loan.totalDue > 0 ? Math.min(100, Math.round((paid / loan.totalDue) * 100)) : 0;

  return (
    <Link
      href={`/portal/loans/${loan.id}`}
      className="block bg-white rounded-2xl border border-line p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-ink-soft">Principal</p>
          <p className="text-xl font-bold font-display text-ink">{formatRWF(loan.principal)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge label={loan.status} tone={statusTone[loan.status]} />
          {loan.isOverdue && <StatusBadge label="overdue" tone="danger" />}
        </div>
      </div>

      <div className="h-2 rounded-full bg-paper-deep overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${loan.isOverdue ? "bg-red-500" : "bg-brand"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-soft">{percent}% repaid</span>
        <span className="text-brand font-medium">
          {loan.status === "active" ? `${formatRWF(loan.outstanding)} left →` : "View details →"}
        </span>
      </div>
    </Link>
  );
}
