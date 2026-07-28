import "server-only";
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { generateSchedule } from "@/lib/loan-math";

export type LoanSummary = {
  id: number;
  borrowerId: number;
  borrowerName: string;
  principal: number;
  termMonths: number;
  status: "active" | "paid_off" | "written_off";
  outstanding: number;
  isOverdue: boolean;
  disbursedAt: Date;
};

export type ScheduleRow = {
  id: number;
  instalmentNumber: number;
  dueDate: Date;
  principalDue: number;
  interestDue: number;
  totalDue: number;
  amountPaid: number;
  status: "pending" | "partial" | "paid";
  isOverdue: boolean;
};

export type PaymentRow = {
  id: number;
  amount: number;
  method: "mtn" | "airtel" | "bank";
  reference: string | null;
  paidAt: Date;
  notes: string | null;
  recordedByEmail: string | null;
};

export type LoanDetail = {
  id: number;
  borrowerId: number;
  borrowerName: string;
  principal: number;
  interestRateMonthly: number;
  termMonths: number;
  status: "active" | "paid_off" | "written_off";
  disbursedAt: Date;
  schedule: ScheduleRow[];
  payments: PaymentRow[];
};

/**
 * Creates a loan, generates its repayment schedule, and inserts both. Reused
 * by standalone loan creation and by application approval, so it accepts an
 * optional transaction connection to join the caller's transaction.
 */
export async function createLoan(
  params: {
    borrowerId: number;
    applicationId?: number | null;
    principal: number;
    termMonths: number;
    disbursedAt: Date;
    disbursedBy: number;
    monthlyRate?: number;
  },
  conn?: PoolConnection
): Promise<number> {
  const db: Pool | PoolConnection = conn ?? pool;
  const monthlyRate = params.monthlyRate ?? 0.05;

  const [result] = await db.query(
    `INSERT INTO loans
       (borrower_id, application_id, principal, interest_rate_monthly, term_months, method, status, disbursed_at, disbursed_by)
     VALUES (?, ?, ?, ?, ?, 'reducing_balance', 'active', ?, ?)`,
    [
      params.borrowerId,
      params.applicationId ?? null,
      params.principal,
      monthlyRate,
      params.termMonths,
      params.disbursedAt,
      params.disbursedBy,
    ]
  );
  const loanId = (result as { insertId: number }).insertId;

  const schedule = generateSchedule(
    params.principal,
    params.termMonths,
    params.disbursedAt,
    monthlyRate
  );

  const rows = schedule.map((instalment) => [
    loanId,
    instalment.instalmentNumber,
    instalment.dueDate,
    instalment.principalPortion,
    instalment.interestPortion,
    instalment.amountDue,
  ]);

  await db.query(
    `INSERT INTO repayment_schedule
       (loan_id, instalment_number, due_date, principal_due, interest_due, total_due)
     VALUES ?`,
    [rows]
  );

  return loanId;
}

export async function listLoans(opts: {
  status?: string;
}): Promise<LoanSummary[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.status) {
    conditions.push("loans.status = ?");
    values.push(opts.status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT loans.id, loans.borrower_id, borrowers.full_name AS borrower_name,
            loans.principal, loans.term_months, loans.status, loans.disbursed_at,
            COALESCE((
              SELECT SUM(total_due - amount_paid) FROM repayment_schedule
              WHERE repayment_schedule.loan_id = loans.id AND repayment_schedule.status <> 'paid'
            ), 0) AS outstanding,
            EXISTS (
              SELECT 1 FROM repayment_schedule
              WHERE repayment_schedule.loan_id = loans.id
                AND repayment_schedule.due_date < CURDATE()
                AND repayment_schedule.status <> 'paid'
            ) AS is_overdue
     FROM loans
     JOIN borrowers ON borrowers.id = loans.borrower_id
     ${where}
     ORDER BY loans.created_at DESC`,
    values
  );

  return rows.map((row) => ({
    id: row.id,
    borrowerId: row.borrower_id,
    borrowerName: row.borrower_name,
    principal: row.principal,
    termMonths: row.term_months,
    status: row.status,
    outstanding: Number(row.outstanding),
    isOverdue: Boolean(row.is_overdue),
    disbursedAt: row.disbursed_at,
  }));
}

export async function getLoanById(id: number): Promise<LoanDetail | null> {
  const [loanRows] = await pool.query<RowDataPacket[]>(
    `SELECT loans.id, loans.borrower_id, borrowers.full_name AS borrower_name,
            loans.principal, loans.interest_rate_monthly, loans.term_months,
            loans.status, loans.disbursed_at
     FROM loans
     JOIN borrowers ON borrowers.id = loans.borrower_id
     WHERE loans.id = ?
     LIMIT 1`,
    [id]
  );
  const loan = loanRows[0];
  if (!loan) return null;

  const [scheduleRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, instalment_number, due_date, principal_due, interest_due, total_due, amount_paid, status,
            (due_date < CURDATE() AND status <> 'paid') AS is_overdue
     FROM repayment_schedule
     WHERE loan_id = ?
     ORDER BY instalment_number ASC`,
    [id]
  );

  const [paymentRows] = await pool.query<RowDataPacket[]>(
    `SELECT payments.id, payments.amount, payments.method, payments.reference,
            payments.paid_at, payments.notes, staff.email AS recorded_by_email
     FROM payments
     LEFT JOIN staff ON staff.id = payments.recorded_by
     WHERE payments.loan_id = ?
     ORDER BY payments.paid_at DESC`,
    [id]
  );

  return {
    id: loan.id,
    borrowerId: loan.borrower_id,
    borrowerName: loan.borrower_name,
    principal: loan.principal,
    interestRateMonthly: Number(loan.interest_rate_monthly),
    termMonths: loan.term_months,
    status: loan.status,
    disbursedAt: loan.disbursed_at,
    schedule: scheduleRows.map((row) => ({
      id: row.id,
      instalmentNumber: row.instalment_number,
      dueDate: row.due_date,
      principalDue: row.principal_due,
      interestDue: row.interest_due,
      totalDue: row.total_due,
      amountPaid: row.amount_paid,
      status: row.status,
      isOverdue: Boolean(row.is_overdue),
    })),
    payments: paymentRows.map((row) => ({
      id: row.id,
      amount: row.amount,
      method: row.method,
      reference: row.reference,
      paidAt: row.paid_at,
      notes: row.notes,
      recordedByEmail: row.recorded_by_email,
    })),
  };
}

export async function listActiveLoansForPicker(): Promise<
  { id: number; borrowerName: string; outstanding: number }[]
> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT loans.id, borrowers.full_name AS borrower_name,
            COALESCE(SUM(repayment_schedule.total_due - repayment_schedule.amount_paid), 0) AS outstanding
     FROM loans
     JOIN borrowers ON borrowers.id = loans.borrower_id
     LEFT JOIN repayment_schedule ON repayment_schedule.loan_id = loans.id AND repayment_schedule.status <> 'paid'
     WHERE loans.status = 'active'
     GROUP BY loans.id, borrowers.full_name
     ORDER BY borrowers.full_name ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    borrowerName: row.borrower_name,
    outstanding: Number(row.outstanding),
  }));
}
