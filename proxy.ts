import { NextRequest, NextResponse } from "next/server";

// TEMPORARY: reduced to a no-op to confirm/rule out whether proxy.ts is the
// source of the production login crash (debug_log showed zero rows, meaning
// the request never reached the login action -- pointing at this layer).
export function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
