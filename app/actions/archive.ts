"use server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { archiveApplication, restoreApplication } from "@/lib/applications";
import { archiveBorrower, restoreBorrower } from "@/lib/borrowers";
import { archiveLoan, restoreLoan } from "@/lib/loans";
import { archivePayment, restorePayment } from "@/lib/payments";

type Entity = "application" | "borrower" | "loan" | "payment";

const archivers: Record<Entity, (id: number, staffId: number) => Promise<void>> = {
  application: archiveApplication,
  borrower: archiveBorrower,
  loan: archiveLoan,
  payment: archivePayment,
};

const restorers: Record<Entity, (id: number, staffId: number) => Promise<void>> = {
  application: restoreApplication,
  borrower: restoreBorrower,
  loan: restoreLoan,
  payment: restorePayment,
};

const paths: Record<Entity, string> = {
  application: "/admin/applications",
  borrower: "/admin/borrowers",
  loan: "/admin/loans",
  payment: "/admin/payments",
};

function parse(formData: FormData) {
  const entity = formData.get("entity") as Entity;
  const id = Number(formData.get("id"));
  return { entity, id };
}

export async function archiveAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();
  const { entity, id } = parse(formData);

  try {
    await archivers[entity](id, session.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to archive." };
  }

  revalidatePath(paths[entity]);
  revalidatePath(`${paths[entity]}/${id}`);
  return { success: true };
}

export async function restoreAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await verifySession();
  const { entity, id } = parse(formData);

  try {
    await restorers[entity](id, session.userId);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to restore." };
  }

  revalidatePath(paths[entity]);
  revalidatePath(`${paths[entity]}/${id}`);
  return { success: true };
}
