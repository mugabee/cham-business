import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool, withTransaction } from "@/lib/db";
import { createBorrower, findOrCreateBorrowerByEmail } from "@/lib/borrowers";
import { createLoan } from "@/lib/loans";
import { logAudit } from "@/lib/audit";
import type { ApplicationData } from "@/lib/validation";
import { calculateApplicationFee, type DocumentKey } from "@/lib/documents";
import type { SavedFile } from "@/lib/uploads";

export type ApplicationSummary = {
  id: number;
  fullName: string;
  phone: string;
  loanType: string;
  amountRequested: number;
  status: "new" | "reviewing" | "approved" | "rejected";
  submittedAt: Date;
  archivedAt: Date | null;
  detailsCompleted: boolean;
};

export type ApplicationDocument = {
  id: number;
  documentType: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
};

export type ApplicationDetail = ApplicationSummary & {
  email: string | null;
  purposeCategory: string | null;
  purpose: string;
  monthlyIncome: number;
  desiredTermMonths: number | null;
  occupation: string | null;
  maritalStatus: "single" | "married" | "divorced" | null;
  workAddress: string | null;
  collateralAddress: string | null;
  feeAmount: number | null;
  borrowerId: number | null;
  reviewedByEmail: string | null;
  reviewedAt: Date | null;
  notes: string | null;
  documents: ApplicationDocument[];
};

/**
 * Creates an application from the (trimmed) public form. The email has
 * already been OTP-verified by this point, so a borrower identity is
 * linked immediately rather than waiting for staff approval -- this is
 * what lets the same person's future applications and loans all surface
 * under one portal account.
 */
export async function createApplicationFromPublicForm(data: ApplicationData): Promise<number> {
  const amount = Number(data.amount.replace(/,/g, ""));
  const monthlyIncome = Number(data.monthlyIncome.replace(/,/g, ""));
  const feeAmount = calculateApplicationFee(amount);

  return withTransaction(async (conn) => {
    const borrowerId = await findOrCreateBorrowerByEmail(
      {
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        monthlyIncome,
      },
      conn
    );

    const [result] = await conn.query(
      `INSERT INTO applications
         (borrower_id, full_name, phone, email, loan_type, amount_requested, purpose,
          monthly_income, fee_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, 'new')`,
      [borrowerId, data.fullName, data.phone, data.email, data.loanType, amount, monthlyIncome, feeAmount]
    );

    return (result as { insertId: number }).insertId;
  });
}

/**
 * Fills in the fields and documents that the trimmed public form no
 * longer collects up front -- done by the borrower through the portal,
 * once their application exists. Ownership-checked: a borrower can only
 * complete their own application, and only while it's still pending.
 */
type ApplicationDetailsParams = {
  purposeCategory: string;
  purpose: string;
  desiredTermMonths: number;
  occupation: string;
  maritalStatus: "single" | "married" | "divorced";
  workAddress: string;
  collateralAddress?: string;
};

async function saveApplicationDetails(
  id: number,
  params: ApplicationDetailsParams,
  documents: Array<SavedFile & { documentType: DocumentKey }>,
  audit: { staffId: number | null; action: string }
): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query(
      `UPDATE applications
       SET purpose_category = ?, purpose = ?, desired_term_months = ?, occupation = ?,
           marital_status = ?, work_address = ?, collateral_address = ?
       WHERE id = ?`,
      [
        params.purposeCategory,
        params.purpose,
        params.desiredTermMonths,
        params.occupation,
        params.maritalStatus,
        params.workAddress,
        params.collateralAddress || null,
        id,
      ]
    );

    for (const doc of documents) {
      await conn.query(
        `INSERT INTO application_documents
           (application_id, document_type, original_filename, stored_filename, mime_type, file_size)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, doc.documentType, doc.originalFilename, doc.storedFilename, doc.mimeType, doc.fileSize]
      );
    }

    await logAudit(conn, {
      staffId: audit.staffId,
      action: audit.action,
      entity: "application",
      entityId: id,
      detail: { occupation: params.occupation, maritalStatus: params.maritalStatus },
    });
  });
}

/**
 * Filled in by the borrower via the portal. Only allowed once the loan has
 * been approved -- staff can approve on the basic info alone, and full
 * KYC-style detail/documents get collected afterward, by whichever of
 * borrower-self-service or staff-on-their-behalf actually happens (some
 * customers aren't comfortable filling this in online themselves).
 */
export async function completeApplicationDetails(
  id: number,
  borrowerId: number,
  params: ApplicationDetailsParams,
  documents: Array<SavedFile & { documentType: DocumentKey }>
): Promise<{ error?: string }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT borrower_id, status FROM applications WHERE id = ? LIMIT 1",
    [id]
  );
  const application = rows[0];
  if (!application) return { error: "Application not found." };
  if (application.borrower_id !== borrowerId) {
    return { error: "You don't have access to this application." };
  }
  if (application.status !== "approved") {
    return { error: "This application hasn't been approved yet." };
  }

  await saveApplicationDetails(id, params, documents, {
    staffId: null,
    action: "application.completed_by_borrower",
  });
  return {};
}

/**
 * Same as completeApplicationDetails, but for staff filling it in on the
 * applicant's behalf (e.g. over the phone) -- no ownership check, since
 * any staff can act on any application, matching the rest of the app.
 */
export async function completeApplicationDetailsByStaff(
  id: number,
  staffId: number,
  params: ApplicationDetailsParams,
  documents: Array<SavedFile & { documentType: DocumentKey }>
): Promise<{ error?: string }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT status FROM applications WHERE id = ? LIMIT 1",
    [id]
  );
  const application = rows[0];
  if (!application) return { error: "Application not found." };
  if (application.status !== "approved") {
    return { error: "This application hasn't been approved yet." };
  }

  await saveApplicationDetails(id, params, documents, {
    staffId,
    action: "application.completed_by_staff",
  });
  return {};
}

export async function listApplicationsForBorrower(
  borrowerId: number
): Promise<ApplicationSummary[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, phone, loan_type, amount_requested, status, submitted_at, archived_at,
            (occupation IS NOT NULL) AS details_completed
     FROM applications
     WHERE borrower_id = ?
     ORDER BY submitted_at DESC`,
    [borrowerId]
  );

  return rows.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    loanType: row.loan_type,
    amountRequested: row.amount_requested,
    status: row.status,
    submittedAt: row.submitted_at,
    archivedAt: row.archived_at,
    detailsCompleted: Boolean(row.details_completed),
  }));
}

export async function getApplicationForBorrower(
  id: number,
  borrowerId: number
): Promise<ApplicationDetail | null> {
  const application = await getApplicationById(id);
  if (!application || application.borrowerId !== borrowerId) return null;
  return application;
}

export async function listApplications(opts: {
  status?: string;
  archived?: boolean;
}): Promise<ApplicationSummary[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  if (opts.status) {
    conditions.push("status = ?");
    values.push(opts.status);
  }
  conditions.push(opts.archived ? "archived_at IS NOT NULL" : "archived_at IS NULL");
  const where = `WHERE ${conditions.join(" AND ")}`;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, phone, loan_type, amount_requested, status, submitted_at, archived_at,
            (occupation IS NOT NULL) AS details_completed
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
    archivedAt: row.archived_at,
    detailsCompleted: Boolean(row.details_completed),
  }));
}

export async function getApplicationById(
  id: number
): Promise<ApplicationDetail | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT applications.id, applications.full_name, applications.phone, applications.email,
            applications.loan_type, applications.amount_requested, applications.purpose_category,
            applications.purpose, applications.monthly_income, applications.desired_term_months,
            applications.occupation, applications.marital_status, applications.work_address,
            applications.collateral_address, applications.fee_amount,
            applications.status, applications.submitted_at,
            applications.borrower_id, applications.reviewed_at, applications.notes,
            applications.archived_at, staff.email AS reviewed_by_email
     FROM applications
     LEFT JOIN staff ON staff.id = applications.reviewed_by
     WHERE applications.id = ?
     LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;

  const [documentRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, document_type, original_filename, mime_type, file_size, uploaded_at
     FROM application_documents
     WHERE application_id = ?
     ORDER BY id ASC`,
    [id]
  );

  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    loanType: row.loan_type,
    amountRequested: row.amount_requested,
    purposeCategory: row.purpose_category,
    purpose: row.purpose,
    monthlyIncome: row.monthly_income,
    desiredTermMonths: row.desired_term_months,
    occupation: row.occupation,
    maritalStatus: row.marital_status,
    workAddress: row.work_address,
    collateralAddress: row.collateral_address,
    feeAmount: row.fee_amount,
    status: row.status,
    submittedAt: row.submitted_at,
    borrowerId: row.borrower_id,
    reviewedByEmail: row.reviewed_by_email,
    reviewedAt: row.reviewed_at,
    notes: row.notes,
    archivedAt: row.archived_at,
    detailsCompleted: Boolean(row.occupation),
    documents: documentRows.map((d) => ({
      id: d.id,
      documentType: d.document_type,
      originalFilename: d.original_filename,
      mimeType: d.mime_type,
      fileSize: d.file_size,
      uploadedAt: d.uploaded_at,
    })),
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

export async function getApplicationDocumentById(id: number): Promise<{
  id: number;
  documentType: string;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
} | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, document_type, original_filename, stored_filename, mime_type
     FROM application_documents WHERE id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    documentType: row.document_type,
    originalFilename: row.original_filename,
    storedFilename: row.stored_filename,
    mimeType: row.mime_type,
  };
}

export async function updateApplication(
  id: number,
  params: {
    fullName: string;
    phone: string;
    email?: string | null;
    loanType: string;
    amountRequested: number;
    monthlyIncome: number;
    purpose: string;
  },
  staffId: number
): Promise<{ error?: string }> {
  return withTransaction(async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT status FROM applications WHERE id = ? LIMIT 1 FOR UPDATE",
      [id]
    );
    const application = rows[0];
    if (!application) return { error: "Application not found." };
    if (application.status !== "new" && application.status !== "reviewing") {
      return { error: "Only a pending application (new or reviewing) can be edited." };
    }

    await conn.query(
      `UPDATE applications
       SET full_name = ?, phone = ?, email = ?, loan_type = ?, amount_requested = ?, monthly_income = ?, purpose = ?
       WHERE id = ?`,
      [
        params.fullName,
        params.phone,
        params.email || null,
        params.loanType,
        params.amountRequested,
        params.monthlyIncome,
        params.purpose,
        id,
      ]
    );

    await logAudit(conn, {
      staffId,
      action: "application.updated",
      entity: "application",
      entityId: id,
      detail: {
        fullName: params.fullName,
        phone: params.phone,
        email: params.email || null,
        loanType: params.loanType,
        amountRequested: params.amountRequested,
        monthlyIncome: params.monthlyIncome,
        purpose: params.purpose,
      },
    });

    return {};
  });
}

export async function archiveApplication(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query("UPDATE applications SET archived_at = NOW() WHERE id = ?", [id]);
    await logAudit(conn, {
      staffId,
      action: "application.archived",
      entity: "application",
      entityId: id,
    });
  });
}

export async function restoreApplication(id: number, staffId: number): Promise<void> {
  await withTransaction(async (conn) => {
    await conn.query("UPDATE applications SET archived_at = NULL WHERE id = ?", [id]);
    await logAudit(conn, {
      staffId,
      action: "application.restored",
      entity: "application",
      entityId: id,
    });
  });
}

/**
 * Permanently deletes an application. Blocked for approved applications --
 * those have already spawned a live borrower/loan, and deleting the
 * application would sever that provenance while the loan lives on.
 */
export async function deleteApplication(
  id: number,
  staffId: number
): Promise<{ error?: string }> {
  return withTransaction(async (conn) => {
    const [rows] = await conn.query<RowDataPacket[]>(
      "SELECT * FROM applications WHERE id = ? LIMIT 1 FOR UPDATE",
      [id]
    );
    const application = rows[0];
    if (!application) {
      return { error: "Application not found." };
    }
    if (application.status === "approved") {
      return {
        error:
          "This application has already been approved and has a linked loan -- delete the loan first if you really need to remove this record.",
      };
    }

    await conn.query("DELETE FROM applications WHERE id = ?", [id]);

    await logAudit(conn, {
      staffId,
      action: "application.deleted",
      entity: "application",
      entityId: id,
      detail: {
        fullName: application.full_name,
        phone: application.phone,
        email: application.email,
        loanType: application.loan_type,
        amountRequested: application.amount_requested,
        purpose: application.purpose,
        monthlyIncome: application.monthly_income,
        status: application.status,
        submittedAt: application.submitted_at,
        borrowerId: application.borrower_id,
        notes: application.notes,
      },
    });

    return {};
  });
}
