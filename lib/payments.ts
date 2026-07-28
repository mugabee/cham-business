import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export type PaymentListRow = {
  id: number;
  loanId: number;
  borrowerName: string;
  amount: number;
  method: "mtn" | "airtel" | "bank";
  reference: string | null;
  paidAt: Date;
  recordedByEmail: string | null;
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
}): Promise<PaymentListRow[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.loanId) {
    conditions.push("payments.loan_id = ?");
    values.push(opts.loanId);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT payments.id, payments.loan_id, borrowers.full_name AS borrower_name,
            payments.amount, payments.method, payments.reference, payments.paid_at,
            staff.email AS recorded_by_email
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
  }));
}
