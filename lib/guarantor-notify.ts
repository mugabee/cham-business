import "server-only";
import { claimUnnotifiedGuarantorsForPaidOffLoan } from "@/lib/guarantors";
import { sendGuarantorRepaymentNoticeEmail } from "@/lib/mailer";
import { getLoanById } from "@/lib/loans";

/**
 * Call after any action that might have just caused a loan to become
 * paid_off (recording a payment, confirming a payment proof). No-op if the
 * loan isn't paid_off yet or has no un-notified guarantors with an email on
 * file -- safe to call unconditionally after every payment-recording path.
 */
export async function notifyGuarantorsOfFullRepayment(loanId: number): Promise<void> {
  const dueGuarantors = await claimUnnotifiedGuarantorsForPaidOffLoan(loanId);
  if (dueGuarantors.length === 0) return;

  const loan = await getLoanById(loanId);
  const borrowerName = loan?.borrowerName ?? "the borrower";

  await Promise.all(
    dueGuarantors.map((g) =>
      sendGuarantorRepaymentNoticeEmail(g.email, g.fullName, borrowerName).catch(() => {
        // Best-effort -- the guarantor record is already marked notified,
        // so a flaky SMTP send doesn't retry-spam on the next payment.
      })
    )
  );
}
