// Kept dependency-free (no DB imports) so proxy.ts can check cookie
// presence without pulling in mysql2 at the module level.
export const SESSION_COOKIE_NAME = "session";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
