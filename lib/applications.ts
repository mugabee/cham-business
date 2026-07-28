import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { createBorrower } from "@/lib/borrowers";
import { createLoan } from "@/lib/loans";
import { logAudit } from "@/lib/audit";
import type { ApplicationData } from "@/lib/validation";

export type ApplicationSummary = {
  id: number;
  fullName: string;
  phone: string;
  loanType: string;
  amountRequested: number;
  status: "new" | "reviewing" | "approved" | "rejected";
  submittedAt: Date;
};

export type ApplicationDetail = ApplicationSummary & {
  email: string | null;
  purpose: string;
  monthlyIncome: number;
  borrowerId: number | null;
  reviewedByEmail: string | null;
  reviewedAt: Date | null;
  notes: string | null;
};

export async function createApplicationFromPublicForm(
  data: ApplicationData
): Promise<void> {
  const amount = Number(data.amount.replace(/,/g, ""));
  const monthlyIncome = Number(data.monthlyIncome.replace(/,/g, ""));

  await pool.query(
    `INSERT INTO applications
       (full_name, phone, email, loan_type, amount_requested, purpose, monthly_income, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
    [
      data.fullName,
      data.phone,
      data.email || null,
      data.loanType,
      amount,
      data.purpose,
      monthlyIncome,
    ]
  );
}

export async function listApplications(opts: {
  status?: string;
}): Promise<ApplicationSummary[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.status) {
    conditions.push("status = ?");
    values.push(opts.status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, phone, loan_type, amount_requested, status, submitted_at
     FROM applications
     ${where}
     ORDER BY submitted_at DESC`,
    values
  );

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    loanType: row.loan_type,
    amountRequested: row.amount_requested,
    status: row.status,
    submittedAt: row.submitted_at,
  }));
}

export async function getApplicationById(
  id: number
): Promise<ApplicationDetail | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT applications.id, applications.full_name, applications.phone, applications.email,
            applications.loan_type, applications.amount_requested, applications.purpose,
            applications.monthly_income, applications.status, applications.submitted_at,
            applications.borrower_id, applications.reviewed_at, applications.notes,
            staff.email AS reviewed_by_email
     FROM applications
     LEFT JOIN staff ON staff.id = applications.reviewed_by
     WHERE applications.id = ?
     LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    loanType: row.loan_type,
    amountRequested: row.amount_requested,
    purpose: row.purpose,
    monthlyIncome: row.monthly_income,
    status: row.status,
    submittedAt: row.submitted_at,
    borrowerId: row.borrower_id,
    reviewedByEmail: row.reviewed_by_email,
    reviewedAt: row.reviewed_at,
    notes: row.notes,
  };
}

export async function approveApplication(params: {
  applicationId: number;
  principal: number;
  termMonths: number;
  disbursedAt: Date;
  nationalId?: string;
  address?: string;
  notes?: string;
  staffId: number;
}): Promise<{ borrowerId: number; loanId: number }> {
  return withTransaction(async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM applications WHERE id = ? LIMIT 1 FOR UPDATE",
      [params.applicationId]
    );
    const application = rows[0];
    if (!application) {
      throw new Error("Application not found");
    }
    if (application.status === "approved") {
      throw new Error("This application has already been approved");
    }

    let borrowerId: number = application.borrower_id;
    if (!borrowerId) {
      borrowerId = await createBorrower(
        {
          fullName: application.full_name,
          phone: application.phone,
          email: application.email,
          nationalId: params.nationalId,
          monthlyIncome: application.monthly_income,
          address: params.address,
          createdBy: params.staffId,
        },
        conn
      );
    }

    const loanId = await createLoan(
      {
        borrowerId,
        applicationId: params.applicationId,
        principal: params.principal,
        termMonths: params.termMonths,
        disbursedAt: params.disbursedAt,
        disbursedBy: params.staffId,
      },
      conn
    );

    await conn.query(
      `UPDATE applications
       SET status = 'approved', borrower_id = ?, reviewed_by = ?, reviewed_at = NOW(), notes = ?
       WHERE id = ?`,
      [borrowerId, params.staffId, params.notes || null, params.applicationId]
    );

    await logAudit(conn, {
      staffId: params.staffId,
      action: "application.approved",
      entity: "application",
      entityId: params.applicationId,
      detail: { borrowerId, loanId, principal: params.principal, termMonths: params.termMonths },
    });

    return { borrowerId, loanId };
  });
}

export async function rejectApplication(params: {
  applicationId: number;
  staffId: number;
  notes: string;
}): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query(
      `UPDATE applications
       SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), notes = ?
       WHERE id = ?`,
      [params.staffId, params.notes, params.applicationId]
    );

    await logAudit(conn, {
      staffId: params.staffId,
      action: "application.rejected",
      entity: "application",
      entityId: params.applicationId,
      detail: { notes: params.notes },
    });
  });
}
