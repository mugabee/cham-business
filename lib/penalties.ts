import "server-only";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export type PenaltyRow = {
  id: number;
  loanId: number;
  amount: number;
  reason: string;
  status: "pending" | "paid" | "waived";
  appliedAt: Date;
  appliedByEmail: string | null;
  resolvedAt: Date | null;
};

async function getOutstandingPrincipal(loanId: number, conn: PoolConnection): Promise<number> {
  const [[loan]] = await conn.query<RowDataPacket[]>(
    "SELECT principal FROM loans WHERE id = ? LIMIT 1 FOR UPDATE",
    [loanId]
  );
  const [[paidRow]] = await conn.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(principal_due), 0) AS paid FROM repayment_schedule WHERE loan_id = ? AND status = 'paid'",
    [loanId]
  );
  return Math.max(0, loan.principal - Number(paidRow.paid));
}

async function getTotalPenalties(loanId: number, conn: PoolConnection): Promise<number> {
  const [[row]] = await conn.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM loan_penalties WHERE loan_id = ? AND status <> 'waived'",
    [loanId]
  );
  return Number(row.total);
}

/**
 * Assesses a penalty against a loan's overdue principal (BNR Reg 55/2022
 * Article 61: penalties may only be computed on overdue principal, never
 * compounded on accrued interest or other penalties). The amount actually
 * applied is clamped so total unwaived penalties never exceed the loan's
 * outstanding principal (Article 40, the in duplum rule) -- rather than
 * rejecting an over-the-cap request outright, it's silently capped to
 * whatever headroom remains, mirroring how the rule describes interest
 * simply ceasing to accrue once the cap is hit.
 */
export async function applyPenalty(params: {
  loanId: number;
  amount: number;
  reason: string;
  staffId: number;
}): Promise<{ error?: string; appliedAmount?: number }> {
  return withTransaction(async (conn) => {
    const [[loan]] = await conn.query<RowDataPacket[]>(
      "SELECT status FROM loans WHERE id = ? LIMIT 1 FOR UPDATE",
      [params.loanId]
    );
    if (!loan) return { error: "Loan not found." };
    if (loan.status !== "active") {
      return { error: "Penalties can only be applied to an active loan." };
    }
    if (params.amount <= 0) {
      return { error: "Enter a penalty amount greater than zero." };
    }

    const outstandingPrincipal = await getOutstandingPrincipal(params.loanId, conn);
    const existingPenalties = await getTotalPenalties(params.loanId, conn);
    const headroom = Math.max(0, outstandingPrincipal - existingPenalties);
    const appliedAmount = Math.min(params.amount, headroom);

    if (appliedAmount <= 0) {
      return {
        error:
          "In duplum rule: total penalties already equal this loan's outstanding principal -- no further penalty can be charged.",
      };
    }

    await conn.query(
      "INSERT INTO loan_penalties (loan_id, amount, reason, applied_by) VALUES (?, ?, ?, ?)",
      [params.loanId, appliedAmount, params.reason, params.staffId]
    );

    await logAudit(conn, {
      staffId: params.staffId,
      action: "penalty.applied",
      entity: "loan",
      entityId: params.loanId,
      detail: {
        requestedAmount: params.amount,
        appliedAmount,
        clamped: appliedAmount < params.amount,
        outstandingPrincipal,
        existingPenalties,
        reason: params.reason,
      },
    });

    return { appliedAmount };
  });
}

export async function listPenaltiesForLoan(loanId: number): Promise<PenaltyRow[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT loan_penalties.id, loan_penalties.loan_id, loan_penalties.amount, loan_penalties.reason,
            loan_penalties.status, loan_penalties.applied_at, loan_penalties.resolved_at,
            staff.email AS applied_by_email
     FROM loan_penalties
     LEFT JOIN staff ON staff.id = loan_penalties.applied_by
     WHERE loan_penalties.loan_id = ?
     ORDER BY loan_penalties.applied_at DESC`,
    [loanId]
  );
  return rows.map((row) => ({
    id: row.id,
    loanId: row.loan_id,
    amount: row.amount,
    reason: row.reason,
    status: row.status,
    appliedAt: row.applied_at,
    appliedByEmail: row.applied_by_email,
    resolvedAt: row.resolved_at,
  }));
}

export async function markPenaltyPaid(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query(
      "UPDATE loan_penalties SET status = 'paid', resolved_by = ?, resolved_at = NOW() WHERE id = ?",
      [staffId, id]
    );
    await logAudit(conn, { staffId, action: "penalty.paid", entity: "penalty", entityId: id });
  });
}

export async function waivePenalty(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query(
      "UPDATE loan_penalties SET status = 'waived', resolved_by = ?, resolved_at = NOW() WHERE id = ?",
      [staffId, id]
    );
    await logAudit(conn, { staffId, action: "penalty.waived", entity: "penalty", entityId: id });
  });
}
