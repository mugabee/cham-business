import { NextRequest, NextResponse } from "next/server";
import { unsubscribeFromJobAlerts } from "@/lib/job-alerts";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const found = token ? await unsubscribeFromJobAlerts(token) : false;

  const message = found
    ? "You've been unsubscribed from job opening alerts."
    : "This unsubscribe link is invalid or has already been used.";

  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribe</title></head>
     <body style="font-family:sans-serif;max-width:480px;margin:80px auto;text-align:center;color:#333;">
       <p>${message}</p>
       <p><a href="/careers">Back to careers</a></p>
     </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
