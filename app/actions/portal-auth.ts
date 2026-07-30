"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "@/lib/db";
import {
  BORROWER_SESSION_COOKIE_NAME,
  borrowerSessionCookieOptions,
  createOtp,
  verifyOtp,
  createBorrowerSession,
  destroyBorrowerSession,
} from "@/lib/borrower-auth";
import { sendOtpEmail } from "@/lib/mailer";
import { otpRequestSchema } from "@/lib/validation";

export async function requestPortalLoginAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const result = otpRequestSchema.safeParse({ email: formData.get("email") });
  if (!result.success) {
    return { error: "Please enter a valid email." };
  }

  // Always report success regardless of whether the account exists, so
  // this endpoint can't be used to enumerate borrower email addresses.
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM borrowers WHERE email = ? LIMIT 1",
    [result.data.email]
  );

  if (rows[0]) {
    const otp = await createOtp(result.data.email, "portal_login");
    if ("error" in otp) {
      return { error: otp.error };
    }
    await sendOtpEmail(result.data.email, otp.code, "portal_login");
  }

  return { success: true };
}

export async function verifyPortalLoginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "");
  const code = String(formData.get("code") ?? "");

  const otpOk = await verifyOtp(email, code, "portal_login");
  if (!otpOk) {
    return { error: "That code is invalid or has expired." };
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM borrowers WHERE email = ? LIMIT 1",
    [email]
  );
  const borrower = rows[0];
  if (!borrower) {
    return { error: "No account found for that email." };
  }

  const { token, expiresAt } = await createBorrowerSession(borrower.id);
  const cookieStore = await cookies();
  cookieStore.set(BORROWER_SESSION_COOKIE_NAME, token, {
    ...borrowerSessionCookieOptions,
    expires: expiresAt,
  });

  redirect("/portal");
}

export async function logoutPortalAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(BORROWER_SESSION_COOKIE_NAME)?.value;
  if (token) {
    await destroyBorrowerSession(token);
  }
  cookieStore.delete(BORROWER_SESSION_COOKIE_NAME);
  redirect("/portal/login");
}
