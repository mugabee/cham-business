import { NextRequest, NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate on the server too — never trust the client alone.
    const result = applicationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // TODO (Phase 2): save to database and/or email the team.
    // For now we accept the application so the flow works end to end.
    // IMPORTANT: do not log sensitive applicant data to the console in production.

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
