// Kept dependency-free (no DB imports) so proxy.ts can check cookie
// presence without pulling in mysql2 at the module level. Separate cookie
// from the staff session -- these are two entirely distinct trust domains.
export const BORROWER_SESSION_COOKIE_NAME = "borrower_session";

export const borrowerSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
