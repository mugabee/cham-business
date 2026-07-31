import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export type DashboardStats = {
  pendingApplicationsCount: number;
  activeLoansCount: number;
  totalOutstanding: number;
  overdueLoansCount: number;
  pendingPaymentProofsCount: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [[appRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS count FROM applications
     WHERE status IN ('new','reviewing') AND archived_at IS NULL`
  );

  const [[loanRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS count,
            COALESCE(SUM(
              (SELECT SUM(total_due - amount_paid) FROM repayment_schedule
               WHERE repayment_schedule.loan_id = loans.id AND repayment_schedule.status <> 'paid')
            ), 0) AS outstanding
     FROM loans
     WHERE status = 'active' AND archived_at IS NULL`
  );

  const [[overdueRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT loans.id) AS count
     FROM loans
     JOIN repayment_schedule ON repayment_schedule.loan_id = loans.id
     WHERE loans.status = 'active' AND loans.archived_at IS NULL
       AND repayment_schedule.due_date < CURDATE() AND repayment_schedule.status <> 'paid'`
  );

  const [[proofRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS count FROM payment_proofs WHERE status = 'pending'`
  );

  return {
    pendingApplicationsCount: appRow.count,
    activeLoansCount: loanRow.count,
    totalOutstanding: Number(loanRow.outstanding),
    overdueLoansCount: overdueRow.count,
    pendingPaymentProofsCount: proofRow.count,
  };
}
