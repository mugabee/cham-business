"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  createSession,
  destroySession,
  findStaffByEmail,
  verifyPassword,
  createPasswordResetToken,
  consumePasswordResetToken,
  updateStaffPassword,
} from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";
import {
  loginSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "@/lib/validation";

// TEMPORARY debug logging to diagnose a production-only login crash.
// Writes to the database instead of a file, since file-based logging never
// showed anything (permission/sandboxing quirk in the hosting environment).
async function logDebug(message: string) {
  try {
    await pool.query("INSERT INTO debug_log (message) VALUES (?)", [message]);
  } catch {
    // best-effort only
  }
}

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await logDebug("login: start");
  try {
    const result = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      await logDebug("login: validation failed");
      return { error: "Invalid email or password." };
    }

    const { email, password } = result.data;
    await logDebug("login: looking up staff");
    const staff = await findStaffByEmail(email);
    await logDebug(`login: staff found=${Boolean(staff)}`);

    if (!staff) {
      return { error: "Invalid email or password." };
    }

    await logDebug("login: verifying password");
    const passwordOk = await verifyPassword(password, staff.password_hash);
    await logDebug(`login: password ok=${passwordOk}`);

    if (!passwordOk) {
      return { error: "Invalid email or password." };
    }

    await logDebug("login: creating session");
    const { token, expiresAt } = await createSession(staff.id);
    await logDebug("login: session created, setting cookie");
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      ...sessionCookieOptions,
      expires: expiresAt,
    });
    await logDebug("login: cookie set, about to redirect");
  } catch (err) {
    // redirect() throws internally with a NEXT_REDIRECT digest — let it pass through untouched.
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    await logDebug(
      `login: caught error: ${err instanceof Error ? err.stack : String(err)}`
    );
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await destroySession(token);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

export async function requestPasswordReset(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const result = requestResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return { error: "Please enter a valid email." };
  }

  // Always report success regardless of whether the account exists,
  // so this endpoint can't be used to enumerate staff email addresses.
  const staff = await findStaffByEmail(result.data.email);

  if (staff) {
    const token = await createPasswordResetToken(staff.id);
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(staff.email, resetUrl);
  }

  return { success: true };
}

export async function resetPassword(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const result = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const consumed = await consumePasswordResetToken(result.data.token);

  if (!consumed) {
    return { error: "This reset link is invalid or has expired." };
  }

  await updateStaffPassword(consumed.staffId, result.data.password);

  redirect("/login?reset=1");
}
