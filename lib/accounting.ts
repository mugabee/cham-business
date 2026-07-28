import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";

export type AccountingTotals = {
  disbursed: number;
  collected: number;
  outstandingPrincipal: number;
  interestEarned: number;
  overdueAmount: number;
};

export async function getAccountingTotals(): Promise<AccountingTotals> {
  const [[disbursedRow]] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(principal), 0) AS total FROM loans"
  );
  const [[collectedRow]] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM payments"
  );
  const [[outstandingRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COALESCE(SUM(rs.principal_due), 0) AS total
     FROM repayment_schedule rs
     JOIN loans l ON l.id = rs.loan_id
     WHERE rs.status <> 'paid' AND l.status <> 'written_off'`
  );
  const [[interestRow]] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(interest_due), 0) AS total FROM repayment_schedule WHERE status = 'paid'"
  );
  const [[overdueRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COALESCE(SUM(rs.total_due - rs.amount_paid), 0) AS total
     FROM repayment_schedule rs
     JOIN loans l ON l.id = rs.loan_id
     WHERE rs.due_date < CURDATE() AND rs.status <> 'paid' AND l.status = 'active'`
  );

  return {
    disbursed: Number(disbursedRow.total),
    collected: Number(collectedRow.total),
    outstandingPrincipal: Number(outstandingRow.total),
    interestEarned: Number(interestRow.total),
    overdueAmount: Number(overdueRow.total),
  };
}

export type LedgerRow = {
  loanId: number;
  borrowerName: string;
  phone: string;
  principal: number;
  termMonths: number;
  disbursedAt: Date;
  status: string;
  totalDue: number;
  totalPaid: number;
  outstanding: number;
  overdue: number;
};

export async function getLoanLedgerRows(): Promise<LedgerRow[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT loans.id AS loan_id, borrowers.full_name AS borrower_name, borrowers.phone,
            loans.principal, loans.term_months, loans.disbursed_at, loans.status,
            COALESCE(SUM(rs.total_due), 0) AS total_due,
            COALESCE(SUM(rs.amount_paid), 0) AS total_paid,
            COALESCE(SUM(rs.total_due - rs.amount_paid), 0) AS outstanding,
            COALESCE(SUM(CASE WHEN rs.due_date < CURDATE() AND rs.status <> 'paid'
                               THEN rs.total_due - rs.amount_paid ELSE 0 END), 0) AS overdue
     FROM loans
     JOIN borrowers ON borrowers.id = loans.borrower_id
     LEFT JOIN repayment_schedule rs ON rs.loan_id = loans.id
     GROUP BY loans.id, borrowers.full_name, borrowers.phone, loans.principal,
              loans.term_months, loans.disbursed_at, loans.status
     ORDER BY loans.disbursed_at DESC`
  );

  return rows.map((row) => ({
    loanId: row.loan_id,
    borrowerName: row.borrower_name,
    phone: row.phone,
    principal: row.principal,
    termMonths: row.term_months,
    disbursedAt: row.disbursed_at,
    status: row.status,
    totalDue: Number(row.total_due),
    totalPaid: Number(row.total_paid),
    outstanding: Number(row.outstanding),
    overdue: Number(row.overdue),
  }));
}
