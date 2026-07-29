import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { recomputeLoanScheduleFromPayments } from "@/lib/loans";

export type PaymentListRow = {
  id: number;
  loanId: number;
  borrowerName: string;
  amount: number;
  method: "mtn" | "airtel" | "bank";
  reference: string | null;
  paidAt: Date;
  recordedByEmail: string | null;
  archivedAt: Date | null;
};

export async function recordPayment(params: {
  loanId: number;
  amount: number;
  method: "mtn" | "airtel" | "bank";
  reference?: string;
  notes?: string;
  staffId: number;
}): Promise<number> {
  return withTransaction(async (conn) => {
    const [scheduleRows] = await conn.query<RowDataPacket[]>(
      `SELECT id, total_due, amount_paid FROM repayment_schedule
       WHERE loan_id = ? AND status IN ('pending', 'partial')
       ORDER BY due_date ASC, instalment_number ASC
       FOR UPDATE`,
      [params.loanId]
    );

    const outstanding = scheduleRows.reduce(
      (sum, row) => sum + (row.total_due - row.amount_paid),
      0
    );

    if (scheduleRows.length === 0) {
      throw new Error("This loan has no outstanding instalments.");
    }
    if (params.amount > outstanding) {
      throw new Error(
        `Payment amount exceeds the outstanding balance of ${outstanding.toLocaleString()} RWF.`
      );
    }

    const [paymentResult] = await conn.query(
      `INSERT INTO payments (loan_id, amount, method, reference, recorded_by, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        params.loanId,
        params.amount,
        params.method,
        params.reference || null,
        params.staffId,
        params.notes || null,
      ]
    );
    const paymentId = (paymentResult as { insertId: number }).insertId;

    let remaining = params.amount;
    for (const row of scheduleRows) {
      if (remaining <= 0) break;
      const rowOutstanding = row.total_due - row.amount_paid;
      const applied = Math.min(remaining, rowOutstanding);
      const newAmountPaid = row.amount_paid + applied;
      const newStatus = newAmountPaid >= row.total_due ? "paid" : "partial";

      await conn.query(
        "UPDATE repayment_schedule SET amount_paid = ?, status = ? WHERE id = ?",
        [newAmountPaid, newStatus, row.id]
      );
      remaining -= applied;
    }

    const [[remainingCount]] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM repayment_schedule WHERE loan_id = ? AND status <> 'paid'",
      [params.loanId]
    );

    if (remainingCount.count === 0) {
      await conn.query("UPDATE loans SET status = 'paid_off' WHERE id = ?", [params.loanId]);
      await logAudit(conn, {
        staffId: params.staffId,
        action: "loan.paid_off",
        entity: "loan",
        entityId: params.loanId,
        detail: {},
      });
    }

    await logAudit(conn, {
      staffId: params.staffId,
      action: "payment.recorded",
      entity: "payment",
      entityId: paymentId,
      detail: { loanId: params.loanId, amount: params.amount, method: params.method },
    });

    return paymentId;
  });
}

export async function listPayments(opts: {
  loanId?: number;
  limit?: number;
  archived?: boolean;
}): Promise<PaymentListRow[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.loanId) {
    conditions.push("payments.loan_id = ?");
    values.push(opts.loanId);
  }
  conditions.push(
    opts.archived ? "payments.archived_at IS NOT NULL" : "payments.archived_at IS NULL"
  );
  const where = `WHERE ${conditions.join(" AND ")}`;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT payments.id, payments.loan_id, borrowers.full_name AS borrower_name,
            payments.amount, payments.method, payments.reference, payments.paid_at,
            payments.archived_at, staff.email AS recorded_by_email
     FROM payments
     JOIN loans ON loans.id = payments.loan_id
     JOIN borrowers ON borrowers.id = loans.borrower_id
     LEFT JOIN staff ON staff.id = payments.recorded_by
     ${where}
     ORDER BY payments.paid_at DESC
     LIMIT ?`,
    [...values, opts.limit ?? 100]
  );

  return rows.map((row) => ({
    id: row.id,
    loanId: row.loan_id,
    borrowerName: row.borrower_name,
    amount: row.amount,
    method: row.method,
    reference: row.reference,
    paidAt: row.paid_at,
    recordedByEmail: row.recorded_by_email,
    archivedAt: row.archived_at,
  }));
}

export async function archivePayment(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query("UPDATE payments SET archived_at = NOW() WHERE id = ?", [id]);
    await logAudit(conn, { staffId, action: "payment.archived", entity: "payment", entityId: id });
  });
}

export async function restorePayment(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query("UPDATE payments SET archived_at = NULL WHERE id = ?", [id]);
    await logAudit(conn, { staffId, action: "payment.restored", entity: "payment", entityId: id });
  });
}

/**
 * Permanently deletes a single payment, then recomputes its loan's entire
 * schedule from the remaining payments (the original sequential allocation
 * can't be trusted once a historical payment is removed from the middle).
 */
export async function deletePayment(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM payments WHERE id = ? LIMIT 1 FOR UPDATE",
      [id]
    );
    const payment = rows[0];
    if (!payment) {
      throw new Error("Payment not found.");
    }

    await conn.query("DELETE FROM payments WHERE id = ?", [id]);

    await logAudit(conn, {
      staffId,
      action: "payment.deleted",
      entity: "payment",
      entityId: id,
      detail: {
        loanId: payment.loan_id,
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        paidAt: payment.paid_at,
        recordedBy: payment.recorded_by,
      },
    });

    await recomputeLoanScheduleFromPayments(payment.loan_id, staffId, conn);
  });
}
