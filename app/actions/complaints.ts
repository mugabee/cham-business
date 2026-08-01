"use server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { updateComplaintStatus } from "@/lib/complaints";
import { updateComplaintStatusSchema } from "@/lib/validation";

export async function updateComplaintStatusAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();

  const result = updateComplaintStatusSchema.safeParse({
    complaintId: formData.get("complaintId"),
    status: formData.get("status"),
    resolutionNotes: formData.get("resolutionNotes") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  await updateComplaintStatus(
    result.data.complaintId,
    { status: result.data.status, resolutionNotes: result.data.resolutionNotes },
    session.userId
  );

  revalidatePath("/admin/complaints");
  return { success: true };
}
