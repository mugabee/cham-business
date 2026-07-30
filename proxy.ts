import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import { BORROWER_SESSION_COOKIE_NAME } from "@/lib/borrower-session-cookie";

// Lightweight, DB-free gate: only checks whether a session cookie is present.
// The authoritative check (does the token hash exist in the sessions table,
// is it unexpired) happens in verifySession()/verifyBorrowerSession(),
// called from the admin/portal layouts — this is defense in depth, not the
// only check. Staff and borrower sessions are two separate cookies/trust
// domains, checked independently.
export function proxy(req: NextRequest) {
  const hasStaffSession = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  const hasBorrowerSession = Boolean(req.cookies.get(BORROWER_SESSION_COOKIE_NAME)?.value);

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (isAdminRoute && !hasStaffSession) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  if (isLoginPage && hasStaffSession) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  const isPortalRoute = req.nextUrl.pathname.startsWith("/portal") && req.nextUrl.pathname !== "/portal/login";
  const isPortalLoginPage = req.nextUrl.pathname === "/portal/login";

  if (isPortalRoute && !hasBorrowerSession) {
    return NextResponse.redirect(new URL("/portal/login", req.nextUrl));
  }
  if (isPortalLoginPage && hasBorrowerSession) {
    return NextResponse.redirect(new URL("/portal", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/portal/:path*"],
};
