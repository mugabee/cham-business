import { NextRequest, NextResponse } from "next/server";
import { otpRequestSchema } from "@/lib/validation";
import { createOtp } from "@/lib/borrower-auth";
import { sendOtpEmail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = otpRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    const otp = await createOtp(result.data.email, "job_application");
    if ("error" in otp) {
      return NextResponse.json({ error: otp.error }, { status: 429 });
    }

    await sendOtpEmail(result.data.email, otp.code, "job_application");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
