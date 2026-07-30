"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import {
  approveApplication,
  rejectApplication,
  updateApplication,
  deleteApplication,
  completeApplicationDetailsByStaff,
  getApplicationById,
} from "@/lib/applications";
import {
  approveApplicationSchema,
  rejectApplicationSchema,
  updateApplicationSchema,
  applicationDetailsSchema,
} from "@/lib/validation";
import { visibleDocumentTypes, type DocumentKey } from "@/lib/documents";
import { saveUploadedFile } from "@/lib/uploads";

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

export async function updateApplicationAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = updateApplicationSchema.safeParse({
    applicationId: formData.get("applicationId"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    loanType: formData.get("loanType"),
    amountRequested: formData.get("amountRequested"),
    monthlyIncome: formData.get("monthlyIncome"),
    purpose: formData.get("purpose"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const { applicationId, ...rest } = result.data;
  const { error } = await updateApplication(applicationId, rest, session.userId);
  if (error) {
    return { error };
  }

  revalidatePath(`/admin/applications/${applicationId}`);
  redirect(`/admin/applications/${applicationId}`);
}

export async function completeApplicationDetailsByStaffAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();

  const result = applicationDetailsSchema.safeParse({
    applicationId: formData.get("applicationId"),
    purposeCategory: formData.get("purposeCategory"),
    purpose: formData.get("purpose"),
    desiredTermMonths: formData.get("desiredTermMonths"),
    occupation: formData.get("occupation"),
    maritalStatus: formData.get("maritalStatus"),
    workAddress: formData.get("workAddress"),
    collateralAddress: formData.get("collateralAddress") || "",
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const application = await getApplicationById(result.data.applicationId);
  if (!application) {
    return { error: "Application not found." };
  }

  const alreadyUploaded = new Set(application.documents.map((d) => d.documentType));
  const expectedDocs = visibleDocumentTypes(application.loanType, result.data.maritalStatus).filter(
    (doc) => !alreadyUploaded.has(doc.key)
  );

  const documents: Array<{ documentType: DocumentKey } & Awaited<ReturnType<typeof saveUploadedFile>>> = [];

  for (const doc of expectedDocs) {
    const file = formData.get(doc.key);
    if (file instanceof File && file.size > 0) {
      const saved = await saveUploadedFile(file);
      documents.push({ documentType: doc.key, ...saved });
    } else if (doc.required) {
      return { error: `Please attach: ${doc.label}` };
    }
  }

  const { error } = await completeApplicationDetailsByStaff(
    result.data.applicationId,
    session.userId,
    {
      purposeCategory: result.data.purposeCategory,
      purpose: result.data.purpose,
      desiredTermMonths: Number(result.data.desiredTermMonths),
      occupation: result.data.occupation,
      maritalStatus: result.data.maritalStatus,
      workAddress: result.data.workAddress,
      collateralAddress: result.data.collateralAddress,
    },
    documents
  );

  if (error) {
    return { error };
  }

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
