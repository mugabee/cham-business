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

// Branded HTML shell for candidate-facing emails: dark navy header with the
// shield mark, a white content card, and a muted footer. Table-based layout
// and inline styles throughout, since email clients (Outlook especially)
// don't reliably support external stylesheets or modern CSS.
const LOGO_URL = "https://chambusiness.org/brand/logo-shield.png";
const SITE_URL = "https://chambusiness.org";

function renderEmailShell(opts: {
  bodyHtml: string;
  cta?: { label: string; url: string };
  footerNote?: string;
}): string {
  const ctaHtml = opts.cta
    ? `<div style="text-align:center;margin:28px 0 4px;">
         <a href="${opts.cta.url}" style="display:inline-block;background-color:#2563b8;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:13px 32px;border-radius:999px;">${opts.cta.label}</a>
       </div>`
    : "";
  const footerNoteHtml = opts.footerNote
    ? `<p style="margin:10px 0 0;font-size:11px;color:#9aa2b1;">${opts.footerNote}</p>`
    : "";

  return `<div style="background-color:#f3f0ea;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(26,39,64,0.1);">
      <tr>
        <td style="background:linear-gradient(135deg,#1b4a8f,#2563b8);padding:28px 24px;text-align:center;">
          <img src="${LOGO_URL}" width="40" height="40" alt="Cham Business Ltd" style="display:block;margin:0 auto 10px;border:0;" />
          <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:1px;">CHAM BUSINESS LTD</span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 28px;color:#1a2740;font-size:15px;line-height:1.65;">
          ${opts.bodyHtml}
          ${ctaHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:20px 28px;background-color:#fbfaf8;border-top:1px solid #e7e3db;text-align:center;">
          <p style="margin:0 0 6px;font-size:12px;color:#5a6478;">Cham Business Ltd &middot; Kicukiro Modern Market, Kigali, Rwanda</p>
          <p style="margin:0;font-size:12px;">
            <a href="${SITE_URL}" style="color:#2563b8;text-decoration:none;">chambusiness.org</a>
            &nbsp;&middot;&nbsp;
            <a href="${SITE_URL}/careers" style="color:#2563b8;text-decoration:none;">Careers</a>
          </p>
          ${footerNoteHtml}
        </td>
      </tr>
    </table>
  </div>`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Reset your Cham Business admin password",
    text: `We received a request to reset your password. Open this link to choose a new one (valid for 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 8px;">We received a request to reset your password.</p>
        <p style="margin:0;color:#5a6478;">This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
      cta: { label: "Reset password", url: resetUrl },
    }),
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
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 20px;">Your verification code is:</p>
        <p style="margin:0 0 20px;text-align:center;font-size:34px;font-weight:800;letter-spacing:8px;color:#1b4a8f;">${code}</p>
        <p style="margin:0;color:#5a6478;">Enter this ${context}. It expires in 10 minutes.</p>
        <p style="margin:12px 0 0;color:#5a6478;">If you didn't request this, you can safely ignore this email.</p>`,
    }),
  });
}

export async function sendPortalAccessEmail(to: string, fullName: string) {
  const loginUrl = `${process.env.APP_URL}/portal/login`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Your Cham Business account is ready",
    text: `Dear ${fullName},\n\nYou can now track your loan and payments online. Visit ${loginUrl} and enter this email address to receive a one-time login code -- no password needed.\n\nCham Business Ltd`,
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 16px;">Dear ${fullName},</p>
        <p style="margin:0;">You can now track your loan and payments online. Enter this email address on the portal login page to receive a one-time login code -- no password needed.</p>`,
      cta: { label: "Go to your portal", url: loginUrl },
    }),
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
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 16px;">Dear ${fullName},</p>
        <p style="margin:0 0 16px;">Good news -- your loan application has been approved:</p>
        <p style="margin:0 0 16px;text-align:center;font-size:22px;font-weight:700;color:#1b4a8f;">RWF ${amount} <span style="font-size:15px;font-weight:400;color:#5a6478;">over ${termMonths} months</span></p>
        <p style="margin:0;color:#5a6478;">Next steps: our team will be in touch to finish your paperwork and arrange disbursement. If you signed for this loan and haven't yet received funds, you may cancel free of charge within 30 days of approval by contacting us.</p>`,
      cta: { label: "Go to your portal", url: `${process.env.APP_URL}/portal/login` },
    }),
  });
}

export async function sendApplicationRejectedEmail(to: string, fullName: string, reason: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Update on your Cham Business loan application",
    text: `Dear ${fullName},\n\nWe're unable to approve your loan application at this time.\n\nReason: ${reason}\n\nYou're welcome to apply again once your circumstances change, or contact us if you'd like guidance on what to improve for next time.\n\nCham Business Ltd`,
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 16px;">Dear ${fullName},</p>
        <p style="margin:0 0 16px;">We're unable to approve your loan application at this time.</p>
        <p style="margin:0 0 16px;"><strong>Reason:</strong> ${reason}</p>
        <p style="margin:0;">You're welcome to apply again once your circumstances change, or contact us if you'd like guidance on what to improve for next time.</p>`,
    }),
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
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 16px;">Dear ${guarantorName},</p>
        <p style="margin:0;">This is to inform you that ${borrowerName}'s loan, which you guaranteed, has been fully repaid. Your guarantee obligation for this loan has ended.</p>`,
    }),
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
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0;"><strong>${fullName}</strong> just applied for <strong>${jobTitle}</strong>.</p>`,
      cta: { label: "Review application", url: adminUrl },
    }),
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
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 16px;">Dear ${fullName},</p>
        <p style="margin:0 0 16px;">Thank you for your interest in the <strong>${jobTitle}</strong> position at Cham Business Ltd. We've successfully received your application and resume.</p>
        <p style="margin:0 0 16px;">Our team carefully reviews every application, and we'll be in touch as soon as we've had a chance to go through yours. We appreciate the time you took to apply, and we wish you the best.</p>
        <p style="margin:0;">Warm regards,<br>The Cham Business Ltd Team</p>`,
      cta: { label: "Check your application status", url: `${SITE_URL}/careers/status` },
    }),
  });
}

export async function sendJobInterviewInviteEmail(to: string, fullName: string, jobTitle: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `You're invited to interview: ${jobTitle}`,
    text: `Dear ${fullName},\n\nThank you for your patience during our review process. We were impressed by your application for the ${jobTitle} position, and we'd like to invite you to the next stage: an interview.\n\nA member of our team will reach out shortly to arrange a time that works for you. In the meantime, if you have any questions, feel free to reply to this email.\n\nWe look forward to speaking with you.\n\nWarm regards,\nThe Cham Business Ltd Team`,
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 16px;">Dear ${fullName},</p>
        <p style="margin:0 0 16px;">Thank you for your patience during our review process. We were impressed by your application for the <strong>${jobTitle}</strong> position, and we'd like to invite you to the next stage: an interview.</p>
        <p style="margin:0 0 16px;">A member of our team will reach out shortly to arrange a time that works for you. In the meantime, if you have any questions, feel free to reply to this email.</p>
        <p style="margin:0 0 16px;">We look forward to speaking with you.</p>
        <p style="margin:0;">Warm regards,<br>The Cham Business Ltd Team</p>`,
    }),
  });
}

export async function sendJobOfferEmail(to: string, fullName: string, jobTitle: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `An offer for you: ${jobTitle} at Cham Business Ltd`,
    text: `Dear ${fullName},\n\nCongratulations! We're pleased to offer you the ${jobTitle} position at Cham Business Ltd. Your background and the impression you made throughout our process stood out to us, and we're excited about the possibility of you joining our team.\n\nA member of our team will be in touch shortly with the full details of the offer and next steps.\n\nCongratulations again, and welcome aboard.\n\nWarm regards,\nThe Cham Business Ltd Team`,
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 16px;">Dear ${fullName},</p>
        <p style="margin:0 0 16px;">Congratulations! We're pleased to offer you the <strong>${jobTitle}</strong> position at Cham Business Ltd. Your background and the impression you made throughout our process stood out to us, and we're excited about the possibility of you joining our team.</p>
        <p style="margin:0 0 16px;">A member of our team will be in touch shortly with the full details of the offer and next steps.</p>
        <p style="margin:0 0 16px;">Congratulations again, and welcome aboard.</p>
        <p style="margin:0;">Warm regards,<br>The Cham Business Ltd Team</p>`,
    }),
  });
}

export async function sendJobApplicationRejectedEmail(to: string, fullName: string, jobTitle: string) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: `Update on your application: ${jobTitle}`,
    text: `Dear ${fullName},\n\nThank you for taking the time to apply for the ${jobTitle} position at Cham Business Ltd, and for your patience throughout our review process.\n\nAfter careful consideration, we've decided to move forward with other candidates whose experience more closely matches what we're looking for at this time. This was not an easy decision, and it does not reflect on your qualifications or potential.\n\nWe encourage you to apply for future openings that match your background, and we wish you every success in your search.\n\nWarm regards,\nThe Cham Business Ltd Team`,
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 16px;">Dear ${fullName},</p>
        <p style="margin:0 0 16px;">Thank you for taking the time to apply for the <strong>${jobTitle}</strong> position at Cham Business Ltd, and for your patience throughout our review process.</p>
        <p style="margin:0 0 16px;">After careful consideration, we've decided to move forward with other candidates whose experience more closely matches what we're looking for at this time. This was not an easy decision, and it does not reflect on your qualifications or potential.</p>
        <p style="margin:0 0 16px;">We encourage you to apply for future openings that match your background, and we wish you every success in your search.</p>
        <p style="margin:0;">Warm regards,<br>The Cham Business Ltd Team</p>`,
      cta: { label: "See open positions", url: `${SITE_URL}/careers` },
    }),
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
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0;">We've just posted a new position:</p>
        <p style="margin:8px 0 0;font-size:19px;font-weight:700;color:#1b4a8f;">${jobTitle}</p>`,
      cta: { label: "View & apply", url: jobUrl },
      footerNote: `Don't want these emails? <a href="${unsubscribeUrl}" style="color:#9aa2b1;">Unsubscribe</a>.`,
    }),
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
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;color:#5a6478;">${dateStr(i.dueDate)}</td><td style="padding:6px 0;text-align:right;font-weight:600;">RWF ${i.amountOverdue.toLocaleString()}</td></tr>`
    )
    .join("");

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Cham Business: overdue loan instalment reminder",
    text: `Dear ${borrowerName},\n\nOur records show the following instalment(s) are now overdue:\n\n${textLines}\n\nTotal overdue: RWF ${total.toLocaleString()}\n\nPlease make payment as soon as possible, or contact us to discuss your repayment plan.\n\nCham Business Ltd`,
    html: renderEmailShell({
      bodyHtml: `<p style="margin:0 0 16px;">Dear ${borrowerName},</p>
        <p style="margin:0 0 12px;">Our records show the following instalment(s) are now overdue:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e3db;border-bottom:1px solid #e7e3db;margin:0 0 16px;font-size:14px;">${htmlItems}</table>
        <p style="margin:0 0 16px;">Total overdue: <strong style="color:#a32d2d;">RWF ${total.toLocaleString()}</strong></p>
        <p style="margin:0;color:#5a6478;">Please make payment as soon as possible, or contact us to discuss your repayment plan.</p>`,
      cta: { label: "Go to your portal", url: `${process.env.APP_URL}/portal/login` },
    }),
  });
}
