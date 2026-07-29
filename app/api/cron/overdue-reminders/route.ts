import { NextRequest, NextResponse } from "next/server";
import { getOverdueNoticesToSend } from "@/lib/reminders";
import { sendOverdueReminderEmail } from "@/lib/mailer";
import { logAudit } from "@/lib/audit";
import { pool } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Hit by a cPanel Cron Job on a daily schedule, e.g.:
 *   curl "https://chambusiness.org/api/cron/overdue-reminders?secret=$CRON_SECRET"
 * Guarded by CRON_SECRET (set in .env.local) rather than staff auth, since
 * cron has no browser session. No "already sent today" tracking -- a
 * borrower who stays overdue gets reminded again on every run.
 */
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notices = await getOverdueNoticesToSend();
  let sent = 0;
  const errors: string[] = [];

  for (const notice of notices) {
    try {
      await sendOverdueReminderEmail(notice.email, notice.borrowerName, notice.installments);
      await logAudit(pool, {
        staffId: null,
        action: "reminder.sent",
        entity: "loan",
        entityId: notice.loanId,
        detail: {
          borrowerId: notice.borrowerId,
          email: notice.email,
          installmentCount: notice.installments.length,
          totalOverdue: notice.installments.reduce((sum, i) => sum + i.amountOverdue, 0),
        },
      });
      sent++;
    } catch (err) {
      errors.push(`${notice.borrowerName}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  return NextResponse.json({ checked: notices.length, sent, errors });
}
