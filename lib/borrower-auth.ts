import "server-only";
import crypto from "crypto";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

export { BORROWER_SESSION_COOKIE_NAME, borrowerSessionCookieOptions } from "@/lib/borrower-session-cookie";

const OTP_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;
const OTP_RATE_LIMIT_WINDOW_MIN = 15;
const OTP_RATE_LIMIT_MAX = 3;
const BORROWER_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function generateOtpCode(): string {
  return String(crypto.randomInt(100000, 1000000));
}

function hashValue(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Issues a fresh 6-digit OTP for (email, purpose), rate-limited to 3
 * requests per 15 minutes per email+purpose to prevent mail-bombing an
 * address. Returns the raw code for the caller to email -- never stored
 * in plaintext, only its hash.
 */
export async function createOtp(
  email: string,
  purpose: string
): Promise<{ code: string } | { error: string }> {
  const [[rateRow]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS count FROM otp_codes
     WHERE email = ? AND purpose = ? AND created_at > NOW() - INTERVAL ? MINUTE`,
    [email, purpose, OTP_RATE_LIMIT_WINDOW_MIN]
  );
  if (rateRow.count >= OTP_RATE_LIMIT_MAX) {
    return { error: "Too many code requests. Please wait a few minutes and try again." };
  }

  const code = generateOtpCode();
  const codeHash = hashValue(code);
  const expiresAt = new Date(Date.now() + OTP_DURATION_MS);

  await pool.query(
    "INSERT INTO otp_codes (email, code_hash, purpose, expires_at) VALUES (?, ?, ?, ?)",
    [email, codeHash, purpose, expiresAt]
  );

  return { code };
}

/**
 * Verifies against the most recent unconsumed, unexpired code for this
 * email+purpose. Wrong guesses increment an attempt counter (capped at 5)
 * rather than invalidating the code outright, so a mistyped digit doesn't
 * force a whole new email round-trip.
 */
export async function verifyOtp(
  email: string,
  code: string,
  purpose: string
): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, code_hash, attempts FROM otp_codes
     WHERE email = ? AND purpose = ? AND consumed_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [email, purpose]
  );
  const row = rows[0];
  if (!row) return false;
  if (row.attempts >= OTP_MAX_ATTEMPTS) return false;

  if (hashValue(code) !== row.code_hash) {
    await pool.query("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?", [row.id]);
    return false;
  }

  await pool.query("UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?", [row.id]);
  return true;
}

export type BorrowerSessionRecord = {
  id: number;
  fullName: string;
  email: string;
};

export async function createBorrowerSession(borrowerId: number) {
  const token = generateToken();
  const tokenHash = hashValue(token);
  const expiresAt = new Date(Date.now() + BORROWER_SESSION_DURATION_MS);

  await pool.query(
    "INSERT INTO borrower_sessions (token_hash, borrower_id, expires_at) VALUES (?, ?, ?)",
    [tokenHash, borrowerId, expiresAt]
  );

  return { token, expiresAt };
}

export async function getBorrowerBySessionToken(
  token: string
): Promise<BorrowerSessionRecord | null> {
  const tokenHash = hashValue(token);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT borrowers.id, borrowers.full_name, borrowers.email
     FROM borrower_sessions
     JOIN borrowers ON borrowers.id = borrower_sessions.borrower_id
     WHERE borrower_sessions.token_hash = ? AND borrower_sessions.expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  const row = rows[0];
  if (!row) return null;

  return { id: row.id, fullName: row.full_name, email: row.email };
}

export async function destroyBorrowerSession(token: string) {
  const tokenHash = hashValue(token);
  await pool.query("DELETE FROM borrower_sessions WHERE token_hash = ?", [tokenHash]);
}
