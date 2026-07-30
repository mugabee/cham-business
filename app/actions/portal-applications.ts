"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyBorrowerSession } from "@/lib/borrower-dal";
import { completeApplicationDetails, getApplicationForBorrower } from "@/lib/applications";
import { applicationDetailsSchema } from "@/lib/validation";
import { visibleDocumentTypes, type DocumentKey } from "@/lib/documents";
import { saveUploadedFile } from "@/lib/uploads";

export async function completeApplicationDetailsAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifyBorrowerSession();

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

  const application = await getApplicationForBorrower(result.data.applicationId, session.borrowerId);
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

  const { error } = await completeApplicationDetails(
    result.data.applicationId,
    session.borrowerId,
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

  revalidatePath("/portal");
  revalidatePath(`/portal/applications/${result.data.applicationId}`);
  redirect("/portal");
}
