import "server-only";
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";

export type BorrowerSummary = {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  createdAt: Date;
  archivedAt: Date | null;
};

export type BorrowerDetail = BorrowerSummary & {
  nationalId: string | null;
  monthlyIncome: number;
  address: string | null;
  loans: {
    id: number;
    principal: number;
    termMonths: number;
    status: string;
    outstanding: number;
  }[];
};

export async function createBorrower(
  params: {
    fullName: string;
    phone: string;
    email?: string | null;
    nationalId?: string | null;
    monthlyIncome: number;
    address?: string | null;
    createdBy: number | null;
  },
  conn?: PoolConnection
): Promise<number> {
  const db: Pool | PoolConnection = conn ?? pool;
  const [result] = await db.query(
    `INSERT INTO borrowers (full_name, phone, email, national_id_enc, monthly_income, address, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      params.fullName,
      params.phone,
      params.email || null,
      params.nationalId ? encrypt(params.nationalId) : null,
      params.monthlyIncome,
      params.address || null,
      params.createdBy,
    ]
  );
  return (result as { insertId: number }).insertId;
}

export async function listBorrowers(opts: {
  search?: string;
  archived?: boolean;
}): Promise<BorrowerSummary[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.search) {
    conditions.push("(full_name LIKE ? OR phone LIKE ?)");
    values.push(`%${opts.search}%`, `%${opts.search}%`);
  }
  conditions.push(opts.archived ? "archived_at IS NOT NULL" : "archived_at IS NULL");
  const where = `WHERE ${conditions.join(" AND ")}`;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, phone, email, created_at, archived_at
     FROM borrowers
     ${where}
     ORDER BY full_name ASC`,
    values
  );

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  }));
}

export async function getBorrowerById(
  id: number
): Promise<BorrowerDetail | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, phone, email, national_id_enc, monthly_income, address, created_at, archived_at
     FROM borrowers WHERE id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;

  const [loanRows] = await pool.query<RowDataPacket[]>(
    `SELECT loans.id, loans.principal, loans.term_months, loans.status,
            COALESCE((
              SELECT SUM(total_due - amount_paid) FROM repayment_schedule
              WHERE repayment_schedule.loan_id = loans.id AND repayment_schedule.status <> 'paid'
            ), 0) AS outstanding
     FROM loans WHERE borrower_id = ? ORDER BY created_at DESC`,
    [id]
  );

  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    nationalId: decrypt(row.national_id_enc),
    monthlyIncome: row.monthly_income,
    address: row.address,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
    loans: loanRows.map((loan) => ({
      id: loan.id,
      principal: loan.principal,
      termMonths: loan.term_months,
      status: loan.status,
      outstanding: Number(loan.outstanding),
    })),
  };
}

export async function updateBorrower(
  id: number,
  params: {
    fullName: string;
    phone: string;
    email?: string | null;
    nationalId?: string | null;
    monthlyIncome: number;
    address?: string | null;
  },
  staffId: number
): Promise<{ error?: string }> {
  return withTransaction(async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM borrowers WHERE id = ? LIMIT 1 FOR UPDATE",
      [id]
    );
    const borrower = rows[0];
    if (!borrower) return { error: "Borrower not found." };

    const nationalIdChanged =
      params.nationalId !== undefined && params.nationalId !== decrypt(borrower.national_id_enc);

    await conn.query(
      `UPDATE borrowers
       SET full_name = ?, phone = ?, email = ?, national_id_enc = ?, monthly_income = ?, address = ?
       WHERE id = ?`,
      [
        params.fullName,
        params.phone,
        params.email || null,
        nationalIdChanged
          ? params.nationalId
            ? encrypt(params.nationalId)
            : null
          : borrower.national_id_enc,
        params.monthlyIncome,
        params.address || null,
        id,
      ]
    );

    await logAudit(conn, {
      staffId,
      action: "borrower.updated",
      entity: "borrower",
      entityId: id,
      detail: {
        fullName: params.fullName,
        phone: params.phone,
        email: params.email || null,
        monthlyIncome: params.monthlyIncome,
        address: params.address || null,
        nationalIdChanged,
      },
    });

    return {};
  });
}

export async function archiveBorrower(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query("UPDATE borrowers SET archived_at = NOW() WHERE id = ?", [id]);
    await logAudit(conn, { staffId, action: "borrower.archived", entity: "borrower", entityId: id });
  });
}

export async function restoreBorrower(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query("UPDATE borrowers SET archived_at = NULL WHERE id = ?", [id]);
    await logAudit(conn, { staffId, action: "borrower.restored", entity: "borrower", entityId: id });
  });
}

/**
 * Permanently deletes a borrower. Blocked if any loans reference them --
 * both a proactive count check and a fallback catch on the raw FK error,
 * since loans.borrower_id is ON DELETE RESTRICT.
 */
export async function deleteBorrower(
  id: number,
  staffId: number
): Promise<{ error?: string }> {
  return withTransaction(async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM borrowers WHERE id = ? LIMIT 1 FOR UPDATE",
      [id]
    );
    const borrower = rows[0];
    if (!borrower) {
      return { error: "Borrower not found." };
    }

    const [[loanCountRow]] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM loans WHERE borrower_id = ?",
      [id]
    );
    if (loanCountRow.count > 0) {
      return {
        error: `Cannot delete: this borrower has ${loanCountRow.count} loan(s). Delete those first.`,
      };
    }

    try {
      await conn.query("DELETE FROM borrowers WHERE id = ?", [id]);
    } catch (err) {
      if ((err as { errno?: number }).errno === 1451) {
        return { error: "Cannot delete: this borrower still has linked records." };
      }
      throw err;
    }

    await logAudit(conn, {
      staffId,
      action: "borrower.deleted",
      entity: "borrower",
      entityId: id,
      detail: {
        fullName: borrower.full_name,
        phone: borrower.phone,
        email: borrower.email,
        monthlyIncome: borrower.monthly_income,
        address: borrower.address,
        hadNationalId: Boolean(borrower.national_id_enc),
      },
    });

    return {};
  });
}
