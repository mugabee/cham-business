"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { createBorrower, updateBorrower, deleteBorrower } from "@/lib/borrowers";
import { logAudit } from "@/lib/audit";
import { pool } from "@/lib/db";
import { borrowerSchema } from "@/lib/validation";

export async function createBorrowerAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = borrowerSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    nationalId: formData.get("nationalId") || undefined,
    monthlyIncome: formData.get("monthlyIncome"),
    address: formData.get("address") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const borrowerId = await createBorrower({
    ...result.data,
    createdBy: session.userId,
  });

  await logAudit(pool, {
    staffId: session.userId,
    action: "borrower.created",
    entity: "borrower",
    entityId: borrowerId,
    detail: { fullName: result.data.fullName },
  });

  redirect(`/admin/borrowers/${borrowerId}`);
}

export async function updateBorrowerAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();
  const id = Number(formData.get("id"));

  const result = borrowerSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    nationalId: formData.get("nationalId") || undefined,
    monthlyIncome: formData.get("monthlyIncome"),
    address: formData.get("address") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const { error } = await updateBorrower(id, result.data, session.userId);
  if (error) {
    return { error };
  }

  revalidatePath(`/admin/borrowers/${id}`);
  redirect(`/admin/borrowers/${id}`);
}

export async function deleteBorrowerAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();
  const id = Number(formData.get("id"));

  const { error } = await deleteBorrower(id, session.userId);
  if (error) {
    return { error };
  }

  revalidatePath("/admin/borrowers");
  redirect("/admin/borrowers");
}
