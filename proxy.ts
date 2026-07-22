import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

// Lightweight, DB-free gate: only checks whether a session cookie is present.
// The authoritative check (does the token hash exist in `sessions`, is it
// unexpired) happens in verifySession() (lib/dal.ts), called from the admin
// layout — this is defense in depth, not the only check.
export function proxy(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (isAdminRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoginPage && hasSession) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
