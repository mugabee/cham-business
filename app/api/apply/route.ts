import { NextRequest, NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation";
import { createApplicationFromPublicForm } from "@/lib/applications";
import { verifyOtp } from "@/lib/borrower-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate on the server too — never trust the client alone.
    const result = applicationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
    }

    const otpOk = await verifyOtp(result.data.email, String(body.otpCode ?? ""), "apply");
    if (!otpOk) {
      return NextResponse.json(
        { error: "That code is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // IMPORTANT: do not log sensitive applicant data to the console in production.
    const applicationId = await createApplicationFromPublicForm(result.data);

    return NextResponse.json({ ok: true, applicationId });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
