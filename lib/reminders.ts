import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export type OverdueInstalment = {
  instalmentNumber: number;
  dueDate: Date;
  amountOverdue: number;
  daysOverdue: number;
};

export type OverdueNotice = {
  borrowerId: number;
  borrowerName: string;
  email: string;
  loanId: number;
  installments: OverdueInstalment[];
};

/**
 * One notice per (borrower, loan) with an email on file and at least one
 * overdue, unpaid instalment on an active, non-archived loan. Intended to be
 * called once per cron run -- there's no "already notified today" tracking,
 * so a borrower who stays overdue gets reminded again on the next run.
 */
export async function getOverdueNoticesToSend(): Promise<OverdueNotice[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT borrowers.id AS borrower_id, borrowers.full_name AS borrower_name, borrowers.email,
            loans.id AS loan_id,
            repayment_schedule.instalment_number, repayment_schedule.due_date,
            repayment_schedule.total_due, repayment_schedule.amount_paid,
            DATEDIFF(CURDATE(), repayment_schedule.due_date) AS days_overdue
     FROM repayment_schedule
     JOIN loans ON loans.id = repayment_schedule.loan_id
     JOIN borrowers ON borrowers.id = loans.borrower_id
     WHERE repayment_schedule.status <> 'paid'
       AND repayment_schedule.due_date < CURDATE()
       AND loans.status = 'active'
       AND loans.archived_at IS NULL
       AND borrowers.email IS NOT NULL
       AND borrowers.email <> ''
     ORDER BY borrowers.id ASC, repayment_schedule.due_date ASC`
  );

  const byLoan = new Map<number, OverdueNotice>();
  for (const row of rows) {
    if (!byLoan.has(row.loan_id)) {
      byLoan.set(row.loan_id, {
        borrowerId: row.borrower_id,
        borrowerName: row.borrower_name,
        email: row.email,
        loanId: row.loan_id,
        installments: [],
      });
    }
    byLoan.get(row.loan_id)!.installments.push({
      instalmentNumber: row.instalment_number,
      dueDate: row.due_date,
      amountOverdue: row.total_due - row.amount_paid,
      daysOverdue: row.days_overdue,
    });
  }

  return Array.from(byLoan.values());
}
