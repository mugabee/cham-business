import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, getStaffBySessionToken } from "@/lib/auth";

export const verifySession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/login");
  }

  const staff = await getStaffBySessionToken(token);

  if (!staff) {
    redirect("/login");
  }

  return { userId: staff.id, email: staff.email, fullName: staff.fullName, role: staff.role };
});
