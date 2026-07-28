import "server-only";
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/crypto";

export type BorrowerSummary = {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  createdAt: Date;
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
}): Promise<BorrowerSummary[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.search) {
    conditions.push("(full_name LIKE ? OR phone LIKE ?)");
    values.push(`%${opts.search}%`, `%${opts.search}%`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, phone, email, created_at
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
  }));
}

export async function getBorrowerById(
  id: number
): Promise<BorrowerDetail | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, phone, email, national_id_enc, monthly_income, address, created_at
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
    loans: loanRows.map((loan) => ({
      id: loan.id,
      principal: loan.principal,
      termMonths: loan.term_months,
      status: loan.status,
      outstanding: Number(loan.outstanding),
    })),
  };
}
