import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BORROWER_SESSION_COOKIE_NAME, getBorrowerBySessionToken } from "@/lib/borrower-auth";

export const verifyBorrowerSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(BORROWER_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/portal/login");
  }

  const borrower = await getBorrowerBySessionToken(token);

  if (!borrower) {
    redirect("/portal/login");
  }

  return { borrowerId: borrower.id, fullName: borrower.fullName, email: borrower.email };
});
