"use server";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { recordPayment } from "@/lib/payments";
import { recordPaymentSchema } from "@/lib/validation";

export async function recordPaymentAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = recordPaymentSchema.safeParse({
    loanId: formData.get("loanId"),
    amount: formData.get("amount"),
    method: formData.get("method"),
    reference: formData.get("reference") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  try {
    await recordPayment({ ...result.data, staffId: session.userId });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to record payment." };
  }

  redirect(`/admin/loans/${result.data.loanId}`);
}
