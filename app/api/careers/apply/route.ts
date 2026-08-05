import { NextRequest, NextResponse } from "next/server";
import { jobApplicationSchema } from "@/lib/validation";
import { createJobApplication } from "@/lib/job-applicants";
import { getJobPostingById } from "@/lib/jobs";
import { saveUploadedFile } from "@/lib/uploads";
import { verifyOtp } from "@/lib/borrower-auth";
import { sendJobApplicationReceivedEmail, sendNewJobApplicationStaffNotification } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const result = jobApplicationSchema.safeParse({
      jobPostingId: formData.get("jobPostingId"),
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      coverLetter: formData.get("coverLetter") || undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Please check the form and try again." },
        { status: 400 }
      );
    }

    const otpOk = await verifyOtp(
      result.data.email,
      String(formData.get("otpCode") ?? ""),
      "job_application"
    );
    if (!otpOk) {
      return NextResponse.json(
        { error: "That code is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const resumeFile = formData.get("resume");
    if (!(resumeFile instanceof File) || resumeFile.size === 0) {
      return NextResponse.json({ error: "Please attach your resume/CV." }, { status: 400 });
    }

    const posting = await getJobPostingById(result.data.jobPostingId);
    if (!posting || posting.status !== "open") {
      return NextResponse.json(
        { error: "This position is no longer accepting applications." },
        { status: 400 }
      );
    }

    let resume;
    try {
      resume = await saveUploadedFile(resumeFile);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Couldn't upload your resume." },
        { status: 400 }
      );
    }

    let applicantId;
    try {
      applicantId = await createJobApplication({
        jobPostingId: result.data.jobPostingId,
        fullName: result.data.fullName,
        email: result.data.email,
        phone: result.data.phone,
        coverLetter: result.data.coverLetter,
        resume,
      });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Couldn't submit your application." },
        { status: 400 }
      );
    }

    await sendJobApplicationReceivedEmail(result.data.email, result.data.fullName, posting.title).catch(() => {
      // Application already saved -- a flaky SMTP send shouldn't block the applicant.
    });
    await sendNewJobApplicationStaffNotification(
      result.data.jobPostingId,
      applicantId,
      result.data.fullName,
      posting.title
    ).catch(() => {
      // Same as above -- the application is already saved either way.
    });

    return NextResponse.json({ ok: true, applicantId });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
