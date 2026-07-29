"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { approveApplication, rejectApplication, deleteApplication } from "@/lib/applications";
import { approveApplicationSchema, rejectApplicationSchema } from "@/lib/validation";

export async function approveApplicationAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = approveApplicationSchema.safeParse({
    applicationId: formData.get("applicationId"),
    principal: formData.get("principal"),
    termMonths: formData.get("termMonths"),
    disbursedAt: formData.get("disbursedAt"),
    nationalId: formData.get("nationalId") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  try {
    await approveApplication({
      applicationId: result.data.applicationId,
      principal: result.data.principal,
      termMonths: result.data.termMonths,
      disbursedAt: new Date(result.data.disbursedAt),
      nationalId: result.data.nationalId,
      address: result.data.address,
      notes: result.data.notes,
      staffId: session.userId,
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to approve application." };
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${result.data.applicationId}`);
  return { success: true };
}

export async function deleteApplicationAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();
  const id = Number(formData.get("id"));

  const { error } = await deleteApplication(id, session.userId);
  if (error) {
    return { error };
  }

  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}

export async function rejectApplicationAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = rejectApplicationSchema.safeParse({
    applicationId: formData.get("applicationId"),
    notes: formData.get("notes"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  await rejectApplication({
    applicationId: result.data.applicationId,
    staffId: session.userId,
    notes: result.data.notes,
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${result.data.applicationId}`);
  return { success: true };
}
