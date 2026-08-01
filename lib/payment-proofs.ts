import "server-only";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import { recordPayment } from "@/lib/payments";
import { logAudit } from "@/lib/audit";
import { saveUploadedFile } from "@/lib/uploads";

export type PaymentProofRow = {
  id: number;
  loanId: number;
  borrowerId: number;
  borrowerName: string;
  amountClaimed: number;
  method: "mtn" | "airtel" | "bank";
  reference: string | null;
  originalFilename: string;
  status: "pending" | "confirmed" | "rejected";
  staffNote: string | null;
  createdAt: Date;
};

function mapRow(row: RowDataPacket): PaymentProofRow {
  return {
    id: row.id,
    loanId: row.loan_id,
    borrowerId: row.borrower_id,
    borrowerName: row.borrower_name,
    amountClaimed: row.amount_claimed,
    method: row.method,
    reference: row.reference,
    originalFilename: row.original_filename,
    status: row.status,
    staffNote: row.staff_note,
    createdAt: row.created_at,
  };
}

/**
 * Stores a borrower's claim that they paid, as evidence for staff to
 * check against the real bank/MoMo statement. Never touches the loan
 * ledger directly -- only confirmPaymentProof() does that, via the same
 * recordPayment() flow staff already use.
 */
export async function submitPaymentProof(params: {
  loanId: number;
  borrowerId: number;
  amountClaimed: number;
  method: "mtn" | "airtel" | "bank";
  reference?: string;
  file: File;
}): Promise<{ error?: string }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT borrower_id, status FROM loans WHERE id = ? LIMIT 1",
    [params.loanId]
  );
  const loan = rows[0];
  if (!loan) return { error: "Loan not found." };
  if (loan.borrower_id !== params.borrowerId) {
    return { error: "You don't have access to this loan." };
  }
  if (loan.status !== "active") {
    return { error: "This loan isn't active." };
  }

  const saved = await saveUploadedFile(params.file);

  await pool.query(
    `INSERT INTO payment_proofs
       (loan_id, borrower_id, amount_claimed, method, reference, original_filename, stored_filename, mime_type, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.loanId,
      params.borrowerId,
      params.amountClaimed,
      params.method,
      params.reference || null,
      saved.originalFilename,
      saved.storedFilename,
      saved.mimeType,
      saved.fileSize,
    ]
  );

  return {};
}

export async function listPaymentProofsForLoan(loanId: number): Promise<PaymentProofRow[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT payment_proofs.id, payment_proofs.loan_id, payment_proofs.borrower_id,
            borrowers.full_name AS borrower_name,
            payment_proofs.amount_claimed, payment_proofs.method, payment_proofs.reference,
            payment_proofs.original_filename, payment_proofs.status, payment_proofs.staff_note,
            payment_proofs.created_at
     FROM payment_proofs
     JOIN borrowers ON borrowers.id = payment_proofs.borrower_id
     WHERE payment_proofs.loan_id = ?
     ORDER BY payment_proofs.created_at DESC`,
    [loanId]
  );
  return rows.map(mapRow);
}

export async function listPendingPaymentProofs(): Promise<PaymentProofRow[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT payment_proofs.id, payment_proofs.loan_id, payment_proofs.borrower_id,
            borrowers.full_name AS borrower_name,
            payment_proofs.amount_claimed, payment_proofs.method, payment_proofs.reference,
            payment_proofs.original_filename, payment_proofs.status, payment_proofs.staff_note,
            payment_proofs.created_at
     FROM payment_proofs
     JOIN borrowers ON borrowers.id = payment_proofs.borrower_id
     WHERE payment_proofs.status = 'pending'
     ORDER BY payment_proofs.created_at ASC`
  );
  return rows.map(mapRow);
}

export async function getPaymentProofFile(id: number): Promise<{
  storedFilename: string;
  mimeType: string;
  originalFilename: string;
} | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT stored_filename, mime_type, original_filename FROM payment_proofs WHERE id = ? LIMIT 1",
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    storedFilename: row.stored_filename,
    mimeType: row.mime_type,
    originalFilename: row.original_filename,
  };
}

export async function confirmPaymentProof(
  id: number,
  staffId: number
): Promise<{ error?: string; loanId?: number }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM payment_proofs WHERE id = ? LIMIT 1",
    [id]
  );
  const proof = rows[0];
  if (!proof) return { error: "Payment proof not found." };
  if (proof.status !== "pending") return { error: "This proof has already been reviewed." };

  let paymentId: number;
  try {
    paymentId = await recordPayment({
      loanId: proof.loan_id,
      amount: proof.amount_claimed,
      method: proof.method,
      reference: proof.reference || undefined,
      notes: "Confirmed from borrower-submitted payment proof.",
      staffId,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to record payment." };
  }

  await pool.query(
    "UPDATE payment_proofs SET status = 'confirmed', reviewed_by = ?, reviewed_at = NOW(), payment_id = ? WHERE id = ?",
    [staffId, paymentId, id]
  );

  await logAudit(pool, {
    staffId,
    action: "payment_proof.confirmed",
    entity: "payment",
    entityId: paymentId,
    detail: { proofId: id, loanId: proof.loan_id },
  });

  return { loanId: proof.loan_id };
}

export async function rejectPaymentProof(
  id: number,
  staffId: number,
  note: string
): Promise<{ error?: string }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM payment_proofs WHERE id = ? LIMIT 1",
    [id]
  );
  const proof = rows[0];
  if (!proof) return { error: "Payment proof not found." };
  if (proof.status !== "pending") return { error: "This proof has already been reviewed." };

  await pool.query(
    "UPDATE payment_proofs SET status = 'rejected', staff_note = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
    [note, staffId, id]
  );

  await logAudit(pool, {
    staffId,
    action: "payment_proof.rejected",
    entity: "loan",
    entityId: proof.loan_id,
    detail: { proofId: id, note },
  });

  return {};
}
