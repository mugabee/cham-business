"use server";
import { revalidatePath } from "next/cache";
import { verifyBorrowerSession } from "@/lib/borrower-dal";
import { submitPaymentProof } from "@/lib/payment-proofs";
import { paymentProofSchema } from "@/lib/validation";

export async function submitPaymentProofAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifyBorrowerSession();

  const result = paymentProofSchema.safeParse({
    loanId: formData.get("loanId"),
    amountClaimed: formData.get("amountClaimed"),
    method: formData.get("method"),
    reference: formData.get("reference") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please attach your payment receipt/screenshot." };
  }

  const { error } = await submitPaymentProof({
    loanId: result.data.loanId,
    borrowerId: session.borrowerId,
    amountClaimed: result.data.amountClaimed,
    method: result.data.method,
    reference: result.data.reference,
    file,
  });

  if (error) {
    return { error };
  }

  revalidatePath(`/portal/loans/${result.data.loanId}`);
  return { success: true };
}
