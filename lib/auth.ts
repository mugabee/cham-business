import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { pool } from "@/lib/db";

export { SESSION_COOKIE_NAME, sessionCookieOptions } from "@/lib/session-cookie";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000; // 1 hour

export type StaffRecord = {
  id: number;
  email: string;
  fullName: string;
  role: string;
};

type StaffRow = RowDataPacket & {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function findStaffByEmail(email: string) {
  const [rows] = await pool.query<StaffRow[]>(
    "SELECT id, email, password_hash, full_name, role FROM staff WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0];
}

export async function createSession(staffId: number) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await pool.query(
    "INSERT INTO sessions (token_hash, staff_id, expires_at) VALUES (?, ?, ?)",
    [tokenHash, staffId, expiresAt]
  );

  return { token, expiresAt };
}

export async function getStaffBySessionToken(
  token: string
): Promise<StaffRecord | null> {
  const tokenHash = hashToken(token);

  const [rows] = await pool.query<StaffRow[]>(
    `SELECT staff.id, staff.email, staff.full_name, staff.role
     FROM sessions
     JOIN staff ON staff.id = sessions.staff_id
     WHERE sessions.token_hash = ? AND sessions.expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  const row = rows[0];
  if (!row) return null;

  return { id: row.id, email: row.email, fullName: row.full_name, role: row.role };
}

export async function destroySession(token: string) {
  const tokenHash = hashToken(token);
  await pool.query("DELETE FROM sessions WHERE token_hash = ?", [tokenHash]);
}

export async function createPasswordResetToken(staffId: number) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_DURATION_MS);

  await pool.query(
    "INSERT INTO password_reset_tokens (token_hash, staff_id, expires_at) VALUES (?, ?, ?)",
    [tokenHash, staffId, expiresAt]
  );

  return token;
}

export async function consumePasswordResetToken(token: string) {
  const tokenHash = hashToken(token);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, staff_id FROM password_reset_tokens
     WHERE token_hash = ? AND expires_at > NOW() AND used_at IS NULL
     LIMIT 1`,
    [tokenHash]
  );

  const row = rows[0];
  if (!row) return null;

  await pool.query(
    "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?",
    [row.id]
  );
  // A password reset invalidates any other active sessions for this account.
  await pool.query("DELETE FROM sessions WHERE staff_id = ?", [row.staff_id]);

  return { staffId: row.staff_id as number };
}

export async function updateStaffPassword(staffId: number, password: string) {
  const passwordHash = await hashPassword(password);
  await pool.query("UPDATE staff SET password_hash = ? WHERE id = ?", [
    passwordHash,
    staffId,
  ]);
}
