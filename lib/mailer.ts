import "server-only";
import path from "path";
import nodemailer from "nodemailer";

// See lib/db.ts for why this is needed here too -- Next.js's request/action
// worker processes don't inherit env vars loaded by server.js at startup.
if (!process.env.SMTP_HOST) {
  try {
    process.loadEnvFile(path.join(process.cwd(), ".env.local"));
  } catch {
    // Fine if the file doesn't exist (e.g. env vars provided another way).
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Reset your Cham Business admin password",
    text: `We received a request to reset your password. Open this link to choose a new one (valid for 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>We received a request to reset your password. Click below to choose a new one (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}

export async function sendOtpEmail(to: string, code: string, purpose: "apply" | "portal_login") {
  const context =
    purpose === "apply"
      ? "to confirm this email address for your loan application"
      : "to log in to your Cham Business account";

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Your Cham Business verification code: ${code}`,
    text: `Your verification code is ${code}. Enter this ${context}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: `<p>Your verification code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${code}</p><p>Enter this ${context}. It expires in 10 minutes.</p><p>If you didn't request this, you can ignore this email.</p>`,
  });
}

export async function sendPortalAccessEmail(to: string, fullName: string) {
  const loginUrl = `${process.env.APP_URL}/portal/login`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Your Cham Business account is ready",
    text: `Dear ${fullName},\n\nYou can now track your loan and payments online. Visit ${loginUrl} and enter this email address to receive a one-time login code -- no password needed.\n\nCham Business Ltd`,
    html: `<p>Dear ${fullName},</p><p>You can now track your loan and payments online. Visit <a href="${loginUrl}">${loginUrl}</a> and enter this email address to receive a one-time login code -- no password needed.</p><p>Cham Business Ltd</p>`,
  });
}

export async function sendOverdueReminderEmail(
  to: string,
  borrowerName: string,
  installments: { dueDate: Date; amountOverdue: number }[]
) {
  const total = installments.reduce((sum, i) => sum + i.amountOverdue, 0);
  const dateStr = (d: Date) => d.toISOString().slice(0, 10);

  const textLines = installments
    .map((i) => `- ${dateStr(i.dueDate)}: RWF ${i.amountOverdue.toLocaleString()}`)
    .join("\n");
  const htmlItems = installments
    .map((i) => `<li>${dateStr(i.dueDate)}: RWF ${i.amountOverdue.toLocaleString()}</li>`)
    .join("");

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Cham Business: overdue loan instalment reminder",
    text: `Dear ${borrowerName},\n\nOur records show the following instalment(s) are now overdue:\n\n${textLines}\n\nTotal overdue: RWF ${total.toLocaleString()}\n\nPlease make payment as soon as possible, or contact us to discuss your repayment plan.\n\nCham Business Ltd`,
    html: `<p>Dear ${borrowerName},</p><p>Our records show the following instalment(s) are now overdue:</p><ul>${htmlItems}</ul><p>Total overdue: RWF ${total.toLocaleString()}</p><p>Please make payment as soon as possible, or contact us to discuss your repayment plan.</p><p>Cham Business Ltd</p>`,
  });
}
