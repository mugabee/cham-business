"use server";
import { checkApplicationStatusSchema } from "@/lib/validation";
import { listApplicantsByEmail } from "@/lib/job-applicants";

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
