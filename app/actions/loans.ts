"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { createLoan, deleteLoan } from "@/lib/loans";
import { logAudit } from "@/lib/audit";
import { pool } from "@/lib/db";
import { createLoanSchema } from "@/lib/validation";

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
