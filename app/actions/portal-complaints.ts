"use server";
import { revalidatePath } from "next/cache";
import { verifyBorrowerSession } from "@/lib/borrower-dal";
import { submitComplaint } from "@/lib/complaints";
import { complaintSchema } from "@/lib/validation";

export async function submitComplaintAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifyBorrowerSession();

  const result = complaintSchema.safeParse({
    category: formData.get("category"),
    description: formData.get("description"),
    loanId: formData.get("loanId") || undefined,
    applicationId: formData.get("applicationId") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  await submitComplaint({
    borrowerId: session.borrowerId,
    loanId: result.data.loanId,
    applicationId: result.data.applicationId,
    category: result.data.category,
    description: result.data.description,
    channel: "portal",
  });

  revalidatePath("/portal/complaints");
  return { success: true };
}
