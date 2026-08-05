"use server";
import { jobApplicationSchema, checkApplicationStatusSchema } from "@/lib/validation";
import { createJobApplication, listApplicantsByEmail } from "@/lib/job-applicants";
import { getJobPostingById } from "@/lib/jobs";
import { saveUploadedFile } from "@/lib/uploads";
import { sendJobApplicationReceivedEmail, sendNewJobApplicationStaffNotification } from "@/lib/mailer";

export async function submitJobApplicationAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const result = jobApplicationSchema.safeParse({
    jobPostingId: formData.get("jobPostingId"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    coverLetter: formData.get("coverLetter") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const resumeFile = formData.get("resume");
  if (!(resumeFile instanceof File) || resumeFile.size === 0) {
    return { error: "Please attach your resume/CV." };
  }

  const posting = await getJobPostingById(result.data.jobPostingId);
  if (!posting || posting.status !== "open") {
    return { error: "This position is no longer accepting applications." };
  }

  let resume;
  try {
    resume = await saveUploadedFile(resumeFile);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't upload your resume." };
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
    return { error: err instanceof Error ? err.message : "Couldn't submit your application." };
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

  return { success: true };
}

export type ApplicationStatusResult = {
  jobPostingTitle: string;
  status: string;
  submittedAt: Date;
};

export async function checkApplicationStatusAction(
  _prevState: { error?: string; results?: ApplicationStatusResult[] } | undefined,
  formData: FormData
) {
  const result = checkApplicationStatusSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Please enter a valid email." };
  }

  const applications = await listApplicantsByEmail(result.data.email);
  if (applications.length === 0) {
    return { error: "We couldn't find any applications submitted with that email address." };
  }

  return {
    results: applications.map((a) => ({
      jobPostingTitle: a.jobPostingTitle,
      status: a.status,
      submittedAt: a.submittedAt,
    })),
  };
}
