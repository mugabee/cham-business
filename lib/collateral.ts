import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export type CollateralRow = {
  id: number;
  loanId: number;
  description: string;
  estimatedValue: number | null;
  registeredAt: Date;
  deregisteredAt: Date | null;
};

export async function registerCollateral(params: {
  loanId: number;
  description: string;
  estimatedValue?: number;
  staffId: number;
}): Promise<number> {
  return withTransaction(async (conn) => {
    const [result] = await conn.query(
      `INSERT INTO loan_collateral (loan_id, description, estimated_value, registered_by)
       VALUES (?, ?, ?, ?)`,
      [params.loanId, params.description, params.estimatedValue ?? null, params.staffId]
    );
    const id = (result as { insertId: number }).insertId;
    await logAudit(conn, {
      staffId: params.staffId,
      action: "collateral.registered",
      entity: "loan",
      entityId: params.loanId,
      detail: { collateralId: id, description: params.description, estimatedValue: params.estimatedValue },
    });
    return id;
  });
}

export async function listCollateralForLoan(loanId: number): Promise<CollateralRow[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, loan_id, description, estimated_value, registered_at, deregistered_at
     FROM loan_collateral WHERE loan_id = ? ORDER BY registered_at ASC`,
    [loanId]
  );
  return rows.map((row) => ({
    id: row.id,
    loanId: row.loan_id,
    description: row.description,
    estimatedValue: row.estimated_value,
    registeredAt: row.registered_at,
    deregisteredAt: row.deregistered_at,
  }));
}

/**
 * BNR Reg 55/2022 Article 34: collateral deregistration is the FSP's
 * responsibility, free of charge, within 15 days of full loan settlement.
 * Allowed any time (staff may legitimately deregister early, e.g. loan
 * written off) -- the loan detail page separately flags when a paid-off
 * loan still has registered collateral past that 15-day window.
 */
export async function deregisterCollateral(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    const [[collateral]] = await conn.query<RowDataPacket[]>(
      "SELECT loan_id FROM loan_collateral WHERE id = ? LIMIT 1",
      [id]
    );
    await conn.query(
      "UPDATE loan_collateral SET deregistered_at = NOW(), deregistered_by = ? WHERE id = ?",
      [staffId, id]
    );
    if (collateral) {
      await logAudit(conn, {
        staffId,
        action: "collateral.deregistered",
        entity: "loan",
        entityId: collateral.loan_id,
        detail: { collateralId: id },
      });
    }
  });
}
