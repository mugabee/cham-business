"use server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { confirmPaymentProof, rejectPaymentProof } from "@/lib/payment-proofs";
import { notifyGuarantorsOfFullRepayment } from "@/lib/guarantor-notify";

export async function confirmPaymentProofAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();
  const id = Number(formData.get("id"));

  const { error, loanId } = await confirmPaymentProof(id, session.userId);
  if (error) {
    return { error };
  }

  if (loanId) {
    await notifyGuarantorsOfFullRepayment(loanId);
  }

  revalidatePath("/admin/payment-proofs");
  return { success: true };
}

export async function rejectPaymentProofAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();
  const id = Number(formData.get("id"));
  const note = String(formData.get("note") ?? "");

  if (!note.trim()) {
    return { error: "Please add a short reason for rejecting this proof." };
  }

  const { error } = await rejectPaymentProof(id, session.userId, note);
  if (error) {
    return { error };
  }

  revalidatePath("/admin/payment-proofs");
  return { success: true };
}
