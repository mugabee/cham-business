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
