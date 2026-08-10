"use client";
import { useState, useActionState } from "react";
import { sendInterviewEmailAction } from "@/app/actions/jobs";
import { formatDate } from "@/lib/format";

function defaultBody(fullName: string, jobTitle: string): string {
  return `Dear ${fullName},

Thank you for your interest in the ${jobTitle} position at Cham Business Ltd.

We are pleased to inform you that you have been selected to proceed to the next stage of the recruitment process.

Before we move forward, we would like to share the key details of the role so you can confirm that you are still interested:

- Working days: You will work 2 to 3 days per week (we are flexible and can discuss the most suitable days for you).
- Salary: The monthly allowance for this internship is 100,000 RWF.
- Main work: Your main responsibility will be to go to crowded places such as markets, taxi parks, and other busy areas to identify and talk to potential clients, introduce them to Cham's quick loan services, collect their contact details, and follow them up. You will also prepare a short daily report and submit it to your supervisor.

At Cham Business Ltd, we value our team members and support their growth. This internship offers practical field experience, helps you develop strong communication and sales skills, and builds a solid foundation for a future career in sales, marketing, or financial services. We maintain a friendly and supportive working environment where contribution and effort are appreciated.

About the next step:
Our interview process is a practical exercise that includes both a written response and a short recorded video. This helps us understand how you would handle real situations in the field.

Please reply to this email confirming that:
1. You understand and accept the working days (2-3 days per week),
2. You understand and accept the salary of 100,000 RWF,
3. You are still interested in proceeding with this opportunity.

Once you confirm, kindly let us know when you are available to complete the interview exercise. You may also share the method that is most comfortable for you.

We look forward to your response.

Best regards,
Recruitment Team
Cham Business Ltd`;
}

export default function InterviewEmailForm({
  applicantId,
  fullName,
  jobTitle,
  sentAt,
}: {
  applicantId: number;
  jobPostingId: number;
  fullName: string;
  jobTitle: string;
  sentAt: Date | null;
}) {
  const [state, formAction, pending] = useActionState(sendInterviewEmailAction, undefined);
  const [subject, setSubject] = useState(`${jobTitle} – Confirmation & Interview Availability`);
  const [body, setBody] = useState(defaultBody(fullName, jobTitle));

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";
  const alreadySent = Boolean(state?.success) || Boolean(sentAt);

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-line p-5 space-y-4">
      <input type="hidden" name="applicantId" value={applicantId} />
      <h2 className="font-semibold text-ink">
        {alreadySent ? "Resend interview details email" : "Send interview details email"}
      </h2>

      {state?.success ? (
        <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Email sent to {fullName}.
        </p>
      ) : sentAt ? (
        <p className="rounded-lg bg-paper-deep border border-line px-4 py-3 text-sm text-ink-soft">
          Already sent on {formatDate(sentAt)}. Sending again will email {fullName} a second time.
        </p>
      ) : (
        <p className="text-xs text-ink-soft">
          Pre-filled for the Sales &amp; Marketing Intern role -- edit the working days, salary, or main
          work if this is for a different position, then review before sending.
        </p>
      )}

      <div>
        <label className={label}>Subject</label>
        <input name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required className={field} />
      </div>

      <div>
        <label className={label}>Message</label>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={18}
          className={`${field} font-mono text-xs leading-relaxed`}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Sending…" : alreadySent ? "Send again" : "Send email"}
      </button>
    </form>
  );
}
