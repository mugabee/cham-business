import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export type GuarantorRow = {
  id: number;
  loanId: number;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  relationshipToBorrower: string | null;
  repaymentNotifiedAt: Date | null;
  createdAt: Date;
};

export async function addGuarantor(params: {
  loanId: number;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  relationshipToBorrower?: string;
  staffId: number;
}): Promise<number> {
  return withTransaction(async (conn) => {
    const [result] = await conn.query(
      `INSERT INTO guarantors (loan_id, full_name, phone, email, address, relationship_to_borrower, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        params.loanId,
        params.fullName,
        params.phone,
        params.email || null,
        params.address || null,
        params.relationshipToBorrower || null,
        params.staffId,
      ]
    );
    const id = (result as { insertId: number }).insertId;
    await logAudit(conn, {
      staffId: params.staffId,
      action: "guarantor.added",
      entity: "loan",
      entityId: params.loanId,
      detail: { guarantorId: id, fullName: params.fullName, phone: params.phone },
    });
    return id;
  });
}

export async function listGuarantorsForLoan(loanId: number): Promise<GuarantorRow[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, loan_id, full_name, phone, email, address, relationship_to_borrower, repayment_notified_at, created_at
     FROM guarantors WHERE loan_id = ? ORDER BY created_at ASC`,
    [loanId]
  );
  return rows.map((row) => ({
    id: row.id,
    loanId: row.loan_id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    relationshipToBorrower: row.relationship_to_borrower,
    repaymentNotifiedAt: row.repayment_notified_at,
    createdAt: row.created_at,
  }));
}

export async function removeGuarantor(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    const [[guarantor]] = await conn.query<RowDataPacket[]>(
      "SELECT loan_id FROM guarantors WHERE id = ? LIMIT 1",
      [id]
    );
    await conn.query("DELETE FROM guarantors WHERE id = ?", [id]);
    if (guarantor) {
      await logAudit(conn, {
        staffId,
        action: "guarantor.removed",
        entity: "loan",
        entityId: guarantor.loan_id,
        detail: { guarantorId: id },
      });
    }
  });
}

/**
 * BNR Reg 55/2022 Article 33: a guarantor must be notified within 15 days
 * of the borrower fully repaying their loan. Called from the action layer
 * right after a payment causes a loan to become paid_off -- returns the
 * guarantors that still need emailing (email present, not yet notified)
 * and immediately marks them notified so a retry doesn't double-send.
 */
export async function claimUnnotifiedGuarantorsForPaidOffLoan(
  loanId: number
): Promise<{ id: number; fullName: string; email: string }[]> {
  return withTransaction(async (conn) => {
    const [[loan]] = await conn.query<RowDataPacket[]>(
      "SELECT status FROM loans WHERE id = ? LIMIT 1",
      [loanId]
    );
    if (!loan || loan.status !== "paid_off") return [];

    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT id, full_name, email FROM guarantors
       WHERE loan_id = ? AND repayment_notified_at IS NULL AND email IS NOT NULL`,
      [loanId]
    );
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    await conn.query("UPDATE guarantors SET repayment_notified_at = NOW() WHERE id IN (?)", [ids]);

    return rows.map((r) => ({ id: r.id, fullName: r.full_name, email: r.email }));
  });
}
