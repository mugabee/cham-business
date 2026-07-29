import "server-only";
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { generateSchedule } from "@/lib/loan-math";
import { logAudit } from "@/lib/audit";

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
  archivedAt: Date | null;
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
  archivedAt: Date | null;
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
  archivedAt: Date | null;
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
  archived?: boolean;
}): Promise<LoanSummary[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.status) {
    conditions.push("loans.status = ?");
    values.push(opts.status);
  }
  conditions.push(opts.archived ? "loans.archived_at IS NOT NULL" : "loans.archived_at IS NULL");
  const where = `WHERE ${conditions.join(" AND ")}`;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT loans.id, loans.borrower_id, borrowers.full_name AS borrower_name,
            loans.principal, loans.term_months, loans.status, loans.disbursed_at, loans.archived_at,
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
    archivedAt: row.archived_at,
  }));
}

export async function getLoanById(id: number): Promise<LoanDetail | null> {
  const [loanRows] = await pool.query<RowDataPacket[]>(
    `SELECT loans.id, loans.borrower_id, borrowers.full_name AS borrower_name,
            loans.principal, loans.interest_rate_monthly, loans.term_months,
            loans.status, loans.disbursed_at, loans.archived_at
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
            payments.paid_at, payments.notes, payments.archived_at, staff.email AS recorded_by_email
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
    archivedAt: loan.archived_at,
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
      archivedAt: row.archived_at,
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
     WHERE loans.status = 'active' AND loans.archived_at IS NULL
     GROUP BY loans.id, borrowers.full_name
     ORDER BY borrowers.full_name ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    borrowerName: row.borrower_name,
    outstanding: Number(row.outstanding),
  }));
}

export async function archiveLoan(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query("UPDATE loans SET archived_at = NOW() WHERE id = ?", [id]);
    await logAudit(conn, { staffId, action: "loan.archived", entity: "loan", entityId: id });
  });
}

export async function restoreLoan(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query("UPDATE loans SET archived_at = NULL WHERE id = ?", [id]);
    await logAudit(conn, { staffId, action: "loan.restored", entity: "loan", entityId: id });
  });
}

export async function writeOffLoan(id: number, staffId: number): Promise<{ error?: string }> {
  return withTransaction(async (conn) => {
    const [[loan]] = await conn.query<RowDataPacket[]>(
      "SELECT status FROM loans WHERE id = ? FOR UPDATE",
      [id]
    );
    if (!loan) return { error: "Loan not found." };
    if (loan.status !== "active") {
      return { error: "Only an active loan can be written off." };
    }
    await conn.query("UPDATE loans SET status = 'written_off' WHERE id = ?", [id]);
    await logAudit(conn, { staffId, action: "loan.written_off", entity: "loan", entityId: id });
    return {};
  });
}

/**
 * Recomputes a loan's entire repayment_schedule from scratch based on its
 * *current* set of payments (used after a payment is deleted, since the
 * original sequential allocation can no longer be trusted). Resets every
 * schedule row to pending/0, then replays the exact same oldest-due-first
 * allocation recordPayment() uses, once per remaining payment in
 * chronological order. Re-derives loans.status, but never touches a
 * 'written_off' loan's status (manual state) even though its schedule
 * still gets recomputed underneath.
 */
export async function recomputeLoanScheduleFromPayments(
  loanId: number,
  staffId: number,
  conn: PoolConnection
): Promise<void> {
  const [scheduleRows] = await conn.query<RowDataPacket[]>(
    `SELECT id, total_due FROM repayment_schedule
     WHERE loan_id = ?
     ORDER BY due_date ASC, instalment_number ASC
     FOR UPDATE`,
    [loanId]
  );

  const [paymentRows] = await conn.query<RowDataPacket[]>(
    `SELECT amount FROM payments
     WHERE loan_id = ?
     ORDER BY paid_at ASC, id ASC
     FOR UPDATE`,
    [loanId]
  );

  // Replay allocation in-memory against the reset schedule.
  const state = scheduleRows.map((row) => ({
    id: row.id as number,
    totalDue: row.total_due as number,
    amountPaid: 0,
  }));

  for (const payment of paymentRows) {
    let remaining = payment.amount as number;
    for (const row of state) {
      if (remaining <= 0) break;
      const rowOutstanding = row.totalDue - row.amountPaid;
      if (rowOutstanding <= 0) continue;
      const applied = Math.min(remaining, rowOutstanding);
      row.amountPaid += applied;
      remaining -= applied;
    }
    // Any leftover here means this payment can no longer be fully absorbed
    // by the schedule (e.g. schedule edited outside the normal flow) --
    // not thrown, since this is recomputing already-accepted history, but
    // worth surfacing to whoever reviews the audit log.
  }

  for (const row of state) {
    const status = row.amountPaid >= row.totalDue ? "paid" : row.amountPaid > 0 ? "partial" : "pending";
    await conn.query("UPDATE repayment_schedule SET amount_paid = ?, status = ? WHERE id = ?", [
      row.amountPaid,
      status,
      row.id,
    ]);
  }

  const [[loanRow]] = await conn.query<RowDataPacket[]>(
    "SELECT status FROM loans WHERE id = ? FOR UPDATE",
    [loanId]
  );
  if (loanRow.status === "written_off") return;

  const allPaid = state.every((row) => row.amountPaid >= row.totalDue);
  const newStatus = allPaid ? "paid_off" : "active";
  if (newStatus !== loanRow.status) {
    await conn.query("UPDATE loans SET status = ? WHERE id = ?", [newStatus, loanId]);
    await logAudit(conn, {
      staffId,
      action: newStatus === "paid_off" ? "loan.paid_off" : "loan.reactivated",
      entity: "loan",
      entityId: loanId,
      detail: { reason: "payment deleted, schedule recomputed" },
    });
  }
}

/**
 * Permanently deletes a loan. Only allowed once it's already 'written_off'
 * -- a deliberate two-step process rather than one confirm() destroying an
 * active loan's payment history. Deletes its payments first (payments.loan_id
 * is ON DELETE RESTRICT), then the loan itself (repayment_schedule cascades
 * via the existing FK).
 */
export async function deleteLoan(
  id: number,
  staffId: number
): Promise<{ error?: string }> {
  return withTransaction(async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM loans WHERE id = ? LIMIT 1 FOR UPDATE",
      [id]
    );
    const loan = rows[0];
    if (!loan) {
      return { error: "Loan not found." };
    }
    if (loan.status !== "written_off") {
      return {
        error: "This loan must be written off before it can be permanently deleted.",
      };
    }

    const [paymentRows] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM payments WHERE loan_id = ? FOR UPDATE",
      [id]
    );

    if (paymentRows.length > 0) {
      await conn.query("DELETE FROM payments WHERE loan_id = ?", [id]);
      for (const payment of paymentRows) {
        await logAudit(conn, {
          staffId,
          action: "payment.deleted",
          entity: "payment",
          entityId: payment.id,
          detail: {
            loanId: id,
            amount: payment.amount,
            method: payment.method,
            reference: payment.reference,
            paidAt: payment.paid_at,
            recordedBy: payment.recorded_by,
          },
        });
      }
    }

    await conn.query("DELETE FROM loans WHERE id = ?", [id]);

    const paymentsTotal = paymentRows.reduce((sum, p) => sum + p.amount, 0);
    await logAudit(conn, {
      staffId,
      action: "loan.deleted",
      entity: "loan",
      entityId: id,
      detail: {
        borrowerId: loan.borrower_id,
        applicationId: loan.application_id,
        principal: loan.principal,
        termMonths: loan.term_months,
        paymentsDeletedCount: paymentRows.length,
        paymentsDeletedTotal: paymentsTotal,
      },
    });

    return {};
  });
}
