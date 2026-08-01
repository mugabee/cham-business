import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export { COMPLAINT_CATEGORIES } from "@/lib/complaint-categories";

export type ComplaintSummary = {
  id: number;
  borrowerId: number | null;
  borrowerName: string | null;
  loanId: number | null;
  applicationId: number | null;
  category: string;
  description: string;
  channel: "portal" | "staff";
  status: "open" | "investigating" | "resolved" | "rejected";
  resolutionNotes: string | null;
  submittedAt: Date;
  resolvedByEmail: string | null;
  resolvedAt: Date | null;
};

export async function submitComplaint(params: {
  borrowerId?: number | null;
  loanId?: number | null;
  applicationId?: number | null;
  category: string;
  description: string;
  channel: "portal" | "staff";
}): Promise<number> {
  return withTransaction(async (conn) => {
    const [result] = await conn.query(
      `INSERT INTO complaints (borrower_id, loan_id, application_id, category, description, channel)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        params.borrowerId ?? null,
        params.loanId ?? null,
        params.applicationId ?? null,
        params.category,
        params.description,
        params.channel,
      ]
    );
    const id = (result as { insertId: number }).insertId;
    await logAudit(conn, {
      staffId: null,
      action: "complaint.submitted",
      entity: "complaint",
      entityId: id,
      detail: { category: params.category, channel: params.channel, borrowerId: params.borrowerId ?? null },
    });
    return id;
  });
}

export async function listComplaints(opts: { status?: string }): Promise<ComplaintSummary[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.status) {
    conditions.push("complaints.status = ?");
    values.push(opts.status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT complaints.id, complaints.borrower_id, borrowers.full_name AS borrower_name,
            complaints.loan_id, complaints.application_id, complaints.category, complaints.description,
            complaints.channel, complaints.status, complaints.resolution_notes, complaints.submitted_at,
            complaints.resolved_at, staff.email AS resolved_by_email
     FROM complaints
     LEFT JOIN borrowers ON borrowers.id = complaints.borrower_id
     LEFT JOIN staff ON staff.id = complaints.resolved_by
     ${where}
     ORDER BY complaints.submitted_at DESC`,
    values
  );

  return rows.map((row) => ({
    id: row.id,
    borrowerId: row.borrower_id,
    borrowerName: row.borrower_name,
    loanId: row.loan_id,
    applicationId: row.application_id,
    category: row.category,
    description: row.description,
    channel: row.channel,
    status: row.status,
    resolutionNotes: row.resolution_notes,
    submittedAt: row.submitted_at,
    resolvedByEmail: row.resolved_by_email,
    resolvedAt: row.resolved_at,
  }));
}

export async function listComplaintsForBorrower(borrowerId: number): Promise<ComplaintSummary[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, borrower_id, loan_id, application_id, category, description, channel, status,
            resolution_notes, submitted_at, resolved_at
     FROM complaints WHERE borrower_id = ? ORDER BY submitted_at DESC`,
    [borrowerId]
  );
  return rows.map((row) => ({
    id: row.id,
    borrowerId: row.borrower_id,
    borrowerName: null,
    loanId: row.loan_id,
    applicationId: row.application_id,
    category: row.category,
    description: row.description,
    channel: row.channel,
    status: row.status,
    resolutionNotes: row.resolution_notes,
    submittedAt: row.submitted_at,
    resolvedByEmail: null,
    resolvedAt: row.resolved_at,
  }));
}

export async function updateComplaintStatus(
  id: number,
  params: { status: "open" | "investigating" | "resolved" | "rejected"; resolutionNotes?: string },
  staffId: number
): Promise<void> {
  await withTransaction(async (conn) => {
    const resolved = params.status === "resolved" || params.status === "rejected";
    await conn.query(
      `UPDATE complaints
       SET status = ?, resolution_notes = ?, resolved_by = ?, resolved_at = ${resolved ? "NOW()" : "NULL"}
       WHERE id = ?`,
      [params.status, params.resolutionNotes || null, resolved ? staffId : null, id]
    );
    await logAudit(conn, {
      staffId,
      action: "complaint.status_updated",
      entity: "complaint",
      entityId: id,
      detail: { status: params.status, resolutionNotes: params.resolutionNotes || null },
    });
  });
}
