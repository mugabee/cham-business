"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { createLoan, deleteLoan, writeOffLoan, restructureLoan, cancelLoanCoolingOff } from "@/lib/loans";
import { applyPenalty, markPenaltyPaid, waivePenalty } from "@/lib/penalties";
import { addGuarantor, removeGuarantor } from "@/lib/guarantors";
import { registerCollateral, deregisterCollateral } from "@/lib/collateral";
import { logAudit } from "@/lib/audit";
import { pool } from "@/lib/db";
import {
  createLoanSchema,
  restructureLoanSchema,
  applyPenaltySchema,
  resolvePenaltySchema,
  guarantorSchema,
  collateralSchema,
  cancelLoanCoolingOffSchema,
} from "@/lib/validation";

export async function createLoanAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = createLoanSchema.safeParse({
    borrowerId: formData.get("borrowerId"),
    principal: formData.get("principal"),
    termMonths: formData.get("termMonths"),
    disbursedAt: formData.get("disbursedAt"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const loanId = await createLoan({
    borrowerId: result.data.borrowerId,
    principal: result.data.principal,
    termMonths: result.data.termMonths,
    disbursedAt: new Date(result.data.disbursedAt),
    disbursedBy: session.userId,
  });

  await logAudit(pool, {
    staffId: session.userId,
    action: "loan.created",
    entity: "loan",
    entityId: loanId,
    detail: { borrowerId: result.data.borrowerId, principal: result.data.principal, termMonths: result.data.termMonths },
  });

  redirect(`/admin/loans/${loanId}`);
}

export async function writeOffLoanAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();
  const id = Number(formData.get("id"));

  const { error } = await writeOffLoan(id, session.userId);
  if (error) {
    return { error };
  }

  revalidatePath(`/admin/loans/${id}`);
  return { success: true };
}

export async function restructureLoanAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();

  const result = restructureLoanSchema.safeParse({
    loanId: formData.get("loanId"),
    newTermMonths: formData.get("newTermMonths"),
    newMonthlyRatePercent: formData.get("newMonthlyRatePercent") || undefined,
    effectiveDate: formData.get("effectiveDate"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const { error } = await restructureLoan({
    loanId: result.data.loanId,
    newTermMonths: result.data.newTermMonths,
    newMonthlyRate:
      result.data.newMonthlyRatePercent !== undefined
        ? result.data.newMonthlyRatePercent / 100
        : undefined,
    effectiveDate: new Date(result.data.effectiveDate),
    staffId: session.userId,
  });

  if (error) {
    return { error };
  }

  revalidatePath(`/admin/loans/${result.data.loanId}`);
  return { success: true };
}

export async function deleteLoanAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();
  const id = Number(formData.get("id"));

  const { error } = await deleteLoan(id, session.userId);
  if (error) {
    return { error };
  }

  revalidatePath("/admin/loans");
  redirect("/admin/loans");
}

export async function cancelLoanCoolingOffAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();

  const result = cancelLoanCoolingOffSchema.safeParse({
    loanId: formData.get("loanId"),
    reason: formData.get("reason"),
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const { error } = await cancelLoanCoolingOff(result.data.loanId, session.userId, result.data.reason);
  if (error) {
    return { error };
  }

  revalidatePath(`/admin/loans/${result.data.loanId}`);
  return { success: true };
}

export async function applyPenaltyAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();

  const result = applyPenaltySchema.safeParse({
    loanId: formData.get("loanId"),
    amount: formData.get("amount"),
    reason: formData.get("reason"),
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const { error } = await applyPenalty({ ...result.data, staffId: session.userId });
  if (error) {
    return { error };
  }

  revalidatePath(`/admin/loans/${result.data.loanId}`);
  return { success: true };
}

export async function markPenaltyPaidAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();

  const result = resolvePenaltySchema.safeParse({
    penaltyId: formData.get("penaltyId"),
    loanId: formData.get("loanId"),
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  await markPenaltyPaid(result.data.penaltyId, session.userId);
  revalidatePath(`/admin/loans/${result.data.loanId}`);
  return { success: true };
}

export async function waivePenaltyAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();

  const result = resolvePenaltySchema.safeParse({
    penaltyId: formData.get("penaltyId"),
    loanId: formData.get("loanId"),
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  await waivePenalty(result.data.penaltyId, session.userId);
  revalidatePath(`/admin/loans/${result.data.loanId}`);
  return { success: true };
}

export async function addGuarantorAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();

  const result = guarantorSchema.safeParse({
    loanId: formData.get("loanId"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    address: formData.get("address") || undefined,
    relationshipToBorrower: formData.get("relationshipToBorrower") || undefined,
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  await addGuarantor({ ...result.data, staffId: session.userId });
  revalidatePath(`/admin/loans/${result.data.loanId}`);
  return { success: true };
}

export async function removeGuarantorAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();
  const id = Number(formData.get("id"));
  const loanId = Number(formData.get("loanId"));

  await removeGuarantor(id, session.userId);
  revalidatePath(`/admin/loans/${loanId}`);
  return { success: true };
}

export async function registerCollateralAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();

  const result = collateralSchema.safeParse({
    loanId: formData.get("loanId"),
    description: formData.get("description"),
    estimatedValue: formData.get("estimatedValue") || undefined,
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  await registerCollateral({ ...result.data, staffId: session.userId });
  revalidatePath(`/admin/loans/${result.data.loanId}`);
  return { success: true };
}

export async function deregisterCollateralAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();
  const id = Number(formData.get("id"));
  const loanId = Number(formData.get("loanId"));

  await deregisterCollateral(id, session.userId);
  revalidatePath(`/admin/loans/${loanId}`);
  return { success: true };
}
