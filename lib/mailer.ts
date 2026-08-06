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

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "apply" | "portal_login" | "job_application"
) {
  const context =
    purpose === "apply"
      ? "to confirm this email address for your loan application"
      : purpose === "job_application"
        ? "to confirm this email address for your job application"
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

/** BNR Reg 55/2022 Article 32: applicants must be notified of a loan decision within 2 working days. */
export async function sendApplicationApprovedEmail(
  to: string,
  fullName: string,
  principal: number,
  termMonths: number
) {
  const amount = principal.toLocaleString();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Your Cham Business loan application has been approved",
    text: `Dear ${fullName},\n\nGood news -- your loan application has been approved: RWF ${amount} over ${termMonths} months.\n\nNext steps: our team will be in touch to finish your paperwork and arrange disbursement. If you signed for this loan and haven't yet received funds, you may cancel free of charge within 30 days of approval by contacting us.\n\nCham Business Ltd`,
    html: `<p>Dear ${fullName},</p><p>Good news — your loan application has been approved: <strong>RWF ${amount}</strong> over <strong>${termMonths} months</strong>.</p><p>Next steps: our team will be in touch to finish your paperwork and arrange disbursement. If you signed for this loan and haven't yet received funds, you may cancel free of charge within 30 days of approval by contacting us.</p><p>Cham Business Ltd</p>`,
  });
}

export async function sendApplicationRejectedEmail(to: string, fullName: string, reason: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Update on your Cham Business loan application",
    text: `Dear ${fullName},\n\nWe're unable to approve your loan application at this time.\n\nReason: ${reason}\n\nYou're welcome to apply again once your circumstances change, or contact us if you'd like guidance on what to improve for next time.\n\nCham Business Ltd`,
    html: `<p>Dear ${fullName},</p><p>We're unable to approve your loan application at this time.</p><p><strong>Reason:</strong> ${reason}</p><p>You're welcome to apply again once your circumstances change, or contact us if you'd like guidance on what to improve for next time.</p><p>Cham Business Ltd</p>`,
  });
}

/** BNR Reg 55/2022 Article 33: a guarantor must be notified within 15 days of full repayment. */
export async function sendGuarantorRepaymentNoticeEmail(
  to: string,
  guarantorName: string,
  borrowerName: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Cham Business: the loan you guaranteed has been fully repaid",
    text: `Dear ${guarantorName},\n\nThis is to inform you that ${borrowerName}'s loan, which you guaranteed, has been fully repaid. Your guarantee obligation for this loan has ended.\n\nCham Business Ltd`,
    html: `<p>Dear ${guarantorName},</p><p>This is to inform you that ${borrowerName}'s loan, which you guaranteed, has been fully repaid. Your guarantee obligation for this loan has ended.</p><p>Cham Business Ltd</p>`,
  });
}

export async function sendNewJobApplicationStaffNotification(
  jobPostingId: number,
  applicantId: number,
  fullName: string,
  jobTitle: string
) {
  const adminUrl = `${process.env.APP_URL}/admin/jobs/${jobPostingId}/applicants/${applicantId}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_FROM,
    subject: `New application: ${jobTitle} -- ${fullName}`,
    text: `${fullName} just applied for ${jobTitle}.\n\nReview it here: ${adminUrl}`,
    html: `<p><strong>${fullName}</strong> just applied for <strong>${jobTitle}</strong>.</p><p><a href="${adminUrl}">Review this application</a></p>`,
  });
}

export async function sendJobApplicationReceivedEmail(
  to: string,
  fullName: string,
  jobTitle: string
) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `We've received your application: ${jobTitle}`,
    text: `Dear ${fullName},\n\nThank you for your interest in the ${jobTitle} position at Cham Business Ltd. We've successfully received your application and resume.\n\nOur team carefully reviews every application, and we'll be in touch as soon as we've had a chance to go through yours. We appreciate the time you took to apply, and we wish you the best.\n\nWarm regards,\nThe Cham Business Ltd Team`,
    html: `<p>Dear ${fullName},</p><p>Thank you for your interest in the <strong>${jobTitle}</strong> position at Cham Business Ltd. We've successfully received your application and resume.</p><p>Our team carefully reviews every application, and we'll be in touch as soon as we've had a chance to go through yours. We appreciate the time you took to apply, and we wish you the best.</p><p>Warm regards,<br>The Cham Business Ltd Team</p>`,
  });
}

export async function sendJobInterviewInviteEmail(to: string, fullName: string, jobTitle: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `You're invited to interview: ${jobTitle}`,
    text: `Dear ${fullName},\n\nThank you for your patience during our review process. We were impressed by your application for the ${jobTitle} position, and we'd like to invite you to the next stage: an interview.\n\nA member of our team will reach out shortly to arrange a time that works for you. In the meantime, if you have any questions, feel free to reply to this email.\n\nWe look forward to speaking with you.\n\nWarm regards,\nThe Cham Business Ltd Team`,
    html: `<p>Dear ${fullName},</p><p>Thank you for your patience during our review process. We were impressed by your application for the <strong>${jobTitle}</strong> position, and we'd like to invite you to the next stage: an interview.</p><p>A member of our team will reach out shortly to arrange a time that works for you. In the meantime, if you have any questions, feel free to reply to this email.</p><p>We look forward to speaking with you.</p><p>Warm regards,<br>The Cham Business Ltd Team</p>`,
  });
}

export async function sendJobOfferEmail(to: string, fullName: string, jobTitle: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `An offer for you: ${jobTitle} at Cham Business Ltd`,
    text: `Dear ${fullName},\n\nCongratulations! We're pleased to offer you the ${jobTitle} position at Cham Business Ltd. Your background and the impression you made throughout our process stood out to us, and we're excited about the possibility of you joining our team.\n\nA member of our team will be in touch shortly with the full details of the offer and next steps.\n\nCongratulations again, and welcome aboard.\n\nWarm regards,\nThe Cham Business Ltd Team`,
    html: `<p>Dear ${fullName},</p><p>Congratulations! We're pleased to offer you the <strong>${jobTitle}</strong> position at Cham Business Ltd. Your background and the impression you made throughout our process stood out to us, and we're excited about the possibility of you joining our team.</p><p>A member of our team will be in touch shortly with the full details of the offer and next steps.</p><p>Congratulations again, and welcome aboard.</p><p>Warm regards,<br>The Cham Business Ltd Team</p>`,
  });
}

export async function sendJobApplicationRejectedEmail(to: string, fullName: string, jobTitle: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Update on your application: ${jobTitle}`,
    text: `Dear ${fullName},\n\nThank you for taking the time to apply for the ${jobTitle} position at Cham Business Ltd, and for your patience throughout our review process.\n\nAfter careful consideration, we've decided to move forward with other candidates whose experience more closely matches what we're looking for at this time. This was not an easy decision, and it does not reflect on your qualifications or potential.\n\nWe encourage you to apply for future openings that match your background, and we wish you every success in your search.\n\nWarm regards,\nThe Cham Business Ltd Team`,
    html: `<p>Dear ${fullName},</p><p>Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position at Cham Business Ltd, and for your patience throughout our review process.</p><p>After careful consideration, we've decided to move forward with other candidates whose experience more closely matches what we're looking for at this time. This was not an easy decision, and it does not reflect on your qualifications or potential.</p><p>We encourage you to apply for future openings that match your background, and we wish you every success in your search.</p><p>Warm regards,<br>The Cham Business Ltd Team</p>`,
  });
}

export async function sendNewJobAlertEmail(
  to: string,
  jobTitle: string,
  jobUrl: string,
  unsubscribeToken: string
) {
  const unsubscribeUrl = `${process.env.APP_URL}/api/careers/unsubscribe?token=${unsubscribeToken}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `New opening at Cham Business Ltd: ${jobTitle}`,
    text: `We've just posted a new position: ${jobTitle}.\n\nView and apply: ${jobUrl}\n\nDon't want these emails? Unsubscribe: ${unsubscribeUrl}`,
    html: `<p>We've just posted a new position: <strong>${jobTitle}</strong>.</p><p><a href="${jobUrl}">View and apply</a></p><p style="font-size:12px;color:#888;">Don't want these emails? <a href="${unsubscribeUrl}">Unsubscribe</a>.</p>`,
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
