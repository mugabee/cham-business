import { NextRequest, NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation";
import { createApplicationFromPublicForm } from "@/lib/applications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate on the server too — never trust the client alone.
    const result = applicationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // IMPORTANT: do not log sensitive applicant data to the console in production.
    await createApplicationFromPublicForm(result.data);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
