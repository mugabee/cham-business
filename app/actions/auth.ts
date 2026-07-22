"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { error: "Invalid email or password." };
  }

  const { email, password } = result.data;
  const staff = await findStaffByEmail(email);

  if (!staff || !(await verifyPassword(password, staff.password_hash))) {
    return { error: "Invalid email or password." };
  }

  const { token, expiresAt } = await createSession(staff.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    ...sessionCookieOptions,
    expires: expiresAt,
  });

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
