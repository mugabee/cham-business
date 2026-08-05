import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import type { SavedFile } from "@/lib/uploads";
import type {
  ApplicantStatus,
  JobApplicantSummary,
  JobApplicantDetail,
  JobApplicantStatusHistoryEntry,
  JobApplicantListRow,
} from "@/lib/job-types";

export type {
  ApplicantStatus,
  JobApplicantSummary,
  JobApplicantDetail,
  JobApplicantStatusHistoryEntry,
  JobApplicantListRow,
} from "@/lib/job-types";
export { APPLICANT_STATUS_LABELS, APPLICANT_PIPELINE } from "@/lib/job-types";

export async function createJobApplication(params: {
  jobPostingId: number;
  fullName: string;
  email: string;
  phone: string;
  coverLetter?: string;
  resume: SavedFile;
}): Promise<number> {
  return withTransaction(async (conn) => {
    const [postingRows] = await conn.query<RowDataPacket[]>(
      "SELECT status FROM job_postings WHERE id = ? LIMIT 1 FOR UPDATE",
      [params.jobPostingId]
    );
    const posting = postingRows[0];
    if (!posting || posting.status !== "open") {
      throw new Error("This position is no longer accepting applications.");
    }

    const [result] = await conn.query(
      `INSERT INTO job_applicants
         (job_posting_id, full_name, email, phone, cover_letter,
          resume_original_filename, resume_stored_filename, resume_mime_type, resume_file_size, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        params.jobPostingId,
        params.fullName,
        params.email,
        params.phone,
        params.coverLetter || null,
        params.resume.originalFilename,
        params.resume.storedFilename,
        params.resume.mimeType,
        params.resume.fileSize,
      ]
    );
    const id = (result as { insertId: number }).insertId;

    await conn.query(
      `INSERT INTO job_applicant_status_history (applicant_id, status, changed_by)
       VALUES (?, 'new', NULL)`,
      [id]
    );

    await logAudit(conn, {
      staffId: null,
      action: "job_applicant.submitted",
      entity: "job_applicant",
      entityId: id,
      detail: { jobPostingId: params.jobPostingId, fullName: params.fullName },
    });

    return id;
  });
}

export async function listApplicantsForPosting(
  jobPostingId: number
): Promise<JobApplicantSummary[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, job_posting_id, full_name, email, phone, status, submitted_at
     FROM job_applicants
     WHERE job_posting_id = ?
     ORDER BY submitted_at DESC`,
    [jobPostingId]
  );

  return rows.map((row) => ({
    id: row.id,
    jobPostingId: row.job_posting_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    submittedAt: row.submitted_at,
  }));
}

export async function getJobApplicantById(id: number): Promise<JobApplicantDetail | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT job_applicants.id, job_applicants.job_posting_id, job_applicants.full_name,
            job_applicants.email, job_applicants.phone, job_applicants.cover_letter,
            job_applicants.resume_original_filename, job_applicants.status, job_applicants.notes,
            job_applicants.submitted_at, job_applicants.reviewed_at,
            job_postings.title AS job_posting_title, staff.email AS reviewed_by_email
     FROM job_applicants
     JOIN job_postings ON job_postings.id = job_applicants.job_posting_id
     LEFT JOIN staff ON staff.id = job_applicants.reviewed_by
     WHERE job_applicants.id = ?
     LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    jobPostingId: row.job_posting_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    coverLetter: row.cover_letter,
    resumeOriginalFilename: row.resume_original_filename,
    status: row.status,
    notes: row.notes,
    submittedAt: row.submitted_at,
    reviewedByEmail: row.reviewed_by_email,
    reviewedAt: row.reviewed_at,
    jobPostingTitle: row.job_posting_title,
  };
}

export async function getJobApplicantResumeById(id: number): Promise<{
  storedFilename: string;
  originalFilename: string;
  mimeType: string;
} | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT resume_stored_filename, resume_original_filename, resume_mime_type
     FROM job_applicants WHERE id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    storedFilename: row.resume_stored_filename,
    originalFilename: row.resume_original_filename,
    mimeType: row.resume_mime_type,
  };
}

export async function updateApplicantStatus(params: {
  applicantId: number;
  status: ApplicantStatus;
  notes?: string;
  staffId: number;
}): Promise<{ email: string; fullName: string; jobPostingTitle: string }> {
  return withTransaction(async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT job_applicants.email, job_applicants.full_name, job_postings.title AS job_posting_title
       FROM job_applicants
       JOIN job_postings ON job_postings.id = job_applicants.job_posting_id
       WHERE job_applicants.id = ? LIMIT 1 FOR UPDATE`,
      [params.applicantId]
    );
    const applicant = rows[0];
    if (!applicant) throw new Error("Applicant not found");

    await conn.query(
      `UPDATE job_applicants
       SET status = ?, notes = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [params.status, params.notes || null, params.staffId, params.applicantId]
    );

    await conn.query(
      `INSERT INTO job_applicant_status_history (applicant_id, status, notes, changed_by)
       VALUES (?, ?, ?, ?)`,
      [params.applicantId, params.status, params.notes || null, params.staffId]
    );

    await logAudit(conn, {
      staffId: params.staffId,
      action: "job_applicant.status_changed",
      entity: "job_applicant",
      entityId: params.applicantId,
      detail: { status: params.status },
    });

    return {
      email: applicant.email,
      fullName: applicant.full_name,
      jobPostingTitle: applicant.job_posting_title,
    };
  });
}

export async function getApplicantStatusHistory(
  applicantId: number
): Promise<JobApplicantStatusHistoryEntry[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT job_applicant_status_history.id, job_applicant_status_history.status,
            job_applicant_status_history.notes, job_applicant_status_history.changed_at,
            staff.email AS changed_by_email
     FROM job_applicant_status_history
     LEFT JOIN staff ON staff.id = job_applicant_status_history.changed_by
     WHERE job_applicant_status_history.applicant_id = ?
     ORDER BY job_applicant_status_history.id ASC`,
    [applicantId]
  );

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    notes: row.notes,
    changedAt: row.changed_at,
    changedByEmail: row.changed_by_email,
  }));
}

/** Search/filter across every posting -- for the "all applicants" admin view. */
export async function listAllApplicants(opts: {
  search?: string;
  status?: ApplicantStatus;
}): Promise<JobApplicantListRow[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (opts.search) {
    conditions.push("(job_applicants.full_name LIKE ? OR job_applicants.email LIKE ?)");
    const like = `%${opts.search}%`;
    values.push(like, like);
  }
  if (opts.status) {
    conditions.push("job_applicants.status = ?");
    values.push(opts.status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT job_applicants.id, job_applicants.job_posting_id, job_applicants.full_name,
            job_applicants.email, job_applicants.phone, job_applicants.status,
            job_applicants.submitted_at, job_postings.title AS job_posting_title
     FROM job_applicants
     JOIN job_postings ON job_postings.id = job_applicants.job_posting_id
     ${where}
     ORDER BY job_applicants.submitted_at DESC`,
    values
  );

  return rows.map((row) => ({
    id: row.id,
    jobPostingId: row.job_posting_id,
    jobPostingTitle: row.job_posting_title,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    submittedAt: row.submitted_at,
  }));
}
