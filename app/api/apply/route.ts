import { NextRequest, NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation";
import { createApplicationFromPublicForm } from "@/lib/applications";
import { saveUploadedFile } from "@/lib/uploads";
import { visibleDocumentTypes, type DocumentKey } from "@/lib/documents";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Validate on the server too — never trust the client alone.
    const result = applicationSchema.safeParse({
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email") || "",
      loanType: formData.get("loanType"),
      amount: formData.get("amount"),
      purposeCategory: formData.get("purposeCategory"),
      purpose: formData.get("purpose"),
      monthlyIncome: formData.get("monthlyIncome"),
      desiredTermMonths: formData.get("desiredTermMonths"),
      occupation: formData.get("occupation"),
      maritalStatus: formData.get("maritalStatus"),
      workAddress: formData.get("workAddress"),
      collateralAddress: formData.get("collateralAddress") || "",
      consent: formData.get("consent") === "on",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const expectedDocs = visibleDocumentTypes(result.data.loanType, result.data.maritalStatus);
    const documents: Array<{ documentType: DocumentKey } & Awaited<ReturnType<typeof saveUploadedFile>>> = [];

    for (const doc of expectedDocs) {
      const file = formData.get(doc.key);
      if (file instanceof File && file.size > 0) {
        const saved = await saveUploadedFile(file);
        documents.push({ documentType: doc.key, ...saved });
      } else if (doc.required) {
        return NextResponse.json({ error: `Please attach: ${doc.label}` }, { status: 400 });
      }
    }

    // IMPORTANT: do not log sensitive applicant data to the console in production.
    await createApplicationFromPublicForm(result.data, documents);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
