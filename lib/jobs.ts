import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import type { EmploymentType, JobPostingStatus, JobPostingSummary, JobPostingDetail } from "@/lib/job-types";

export type { EmploymentType, JobPostingStatus, JobPostingSummary, JobPostingDetail } from "@/lib/job-types";
export { EMPLOYMENT_TYPE_LABELS } from "@/lib/job-types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "role";
  let slug = base;
  let n = 2;
  while (true) {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM job_postings WHERE slug = ? LIMIT 1",
      [slug]
    );
    if (rows.length === 0) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

export type JobPostingInput = {
  title: string;
  department?: string;
  location: string;
  employmentType: EmploymentType;
  summary: string;
  description: string;
  requirements: string;
};

export async function createJobPosting(
  input: JobPostingInput,
  staffId: number
): Promise<number> {
  const slug = await uniqueSlug(input.title);

  return withTransaction(async (conn) => {
    const [result] = await conn.query(
      `INSERT INTO job_postings
         (title, slug, department, location, employment_type, summary, description, requirements, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
      [
        input.title,
        slug,
        input.department || null,
        input.location,
        input.employmentType,
        input.summary,
        input.description,
        input.requirements,
        staffId,
      ]
    );
    const id = (result as { insertId: number }).insertId;

    await logAudit(conn, {
      staffId,
      action: "job_posting.created",
      entity: "job_posting",
      entityId: id,
      detail: { title: input.title, slug },
    });

    return id;
  });
}

export async function updateJobPosting(
  id: number,
  input: JobPostingInput,
  staffId: number
): Promise<{ error?: string }> {
  await withTransaction(async (conn) => {
    await conn.query(
      `UPDATE job_postings
       SET title = ?, department = ?, location = ?, employment_type = ?, summary = ?, description = ?, requirements = ?
       WHERE id = ?`,
      [
        input.title,
        input.department || null,
        input.location,
        input.employmentType,
        input.summary,
        input.description,
        input.requirements,
        id,
      ]
    );

    await logAudit(conn, {
      staffId,
      action: "job_posting.updated",
      entity: "job_posting",
      entityId: id,
      detail: { title: input.title },
    });
  });

  return {};
}

export async function setJobPostingStatus(
  id: number,
  status: JobPostingStatus,
  staffId: number
): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query(
      `UPDATE job_postings SET status = ?, closed_at = ${status === "closed" ? "NOW()" : "NULL"} WHERE id = ?`,
      [status, id]
    );

    await logAudit(conn, {
      staffId,
      action: `job_posting.${status}`,
      entity: "job_posting",
      entityId: id,
    });
  });
}

/**
 * Only allowed while a posting has never received an applicant -- once
 * someone has applied, closing the posting (not deleting it) is the way
 * to stop accepting new applications while keeping their file intact.
 */
export async function deleteJobPosting(
  id: number,
  staffId: number
): Promise<{ error?: string }> {
  return withTransaction(async (conn) => {
    const [countRows] = await conn.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS count FROM job_applicants WHERE job_posting_id = ?",
      [id]
    );
    if (countRows[0].count > 0) {
      return { error: "This posting already has applicants -- close it instead of deleting it." };
    }

    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT title FROM job_postings WHERE id = ? LIMIT 1",
      [id]
    );
    const posting = rows[0];
    if (!posting) return { error: "Job posting not found." };

    await conn.query("DELETE FROM job_postings WHERE id = ?", [id]);

    await logAudit(conn, {
      staffId,
      action: "job_posting.deleted",
      entity: "job_posting",
      entityId: id,
      detail: { title: posting.title },
    });

    return {};
  });
}

export async function listJobPostings(opts: {
  status?: JobPostingStatus;
}): Promise<JobPostingSummary[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.status) {
    conditions.push("job_postings.status = ?");
    values.push(opts.status);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT job_postings.id, job_postings.title, job_postings.slug, job_postings.department,
            job_postings.location, job_postings.employment_type, job_postings.summary,
            job_postings.status, job_postings.created_at,
            (SELECT COUNT(*) FROM job_applicants WHERE job_applicants.job_posting_id = job_postings.id) AS applicant_count
     FROM job_postings
     ${where}
     ORDER BY job_postings.created_at DESC`,
    values
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    department: row.department,
    location: row.location,
    employmentType: row.employment_type,
    summary: row.summary,
    status: row.status,
    createdAt: row.created_at,
    applicantCount: row.applicant_count,
  }));
}

/** Public listing: only postings staff have published as open. */
export async function listOpenJobPostings(): Promise<JobPostingSummary[]> {
  return listJobPostings({ status: "open" });
}

export async function getJobPostingById(id: number): Promise<JobPostingDetail | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, slug, department, location, employment_type, summary, description,
            requirements, status, created_at, closed_at
     FROM job_postings WHERE id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    department: row.department,
    location: row.location,
    employmentType: row.employment_type,
    summary: row.summary,
    description: row.description,
    requirements: row.requirements,
    status: row.status,
    createdAt: row.created_at,
    closedAt: row.closed_at,
  };
}

export async function getJobPostingBySlug(slug: string): Promise<JobPostingDetail | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, title, slug, department, location, employment_type, summary, description,
            requirements, status, created_at, closed_at
     FROM job_postings WHERE slug = ? LIMIT 1`,
    [slug]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    department: row.department,
    location: row.location,
    employmentType: row.employment_type,
    summary: row.summary,
    description: row.description,
    requirements: row.requirements,
    status: row.status,
    createdAt: row.created_at,
    closedAt: row.closed_at,
  };
}
