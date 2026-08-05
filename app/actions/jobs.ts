"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import {
  createJobPosting,
  updateJobPosting,
  setJobPostingStatus,
  deleteJobPosting,
} from "@/lib/jobs";
import { updateApplicantStatus } from "@/lib/job-applicants";
import { jobPostingSchema, updateApplicantStatusSchema } from "@/lib/validation";
import { sendJobApplicationStatusEmail } from "@/lib/mailer";

function parsePostingInput(formData: FormData) {
  return jobPostingSchema.safeParse({
    title: formData.get("title"),
    department: formData.get("department") || undefined,
    location: formData.get("location"),
    employmentType: formData.get("employmentType"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
  });
}

export async function createJobPostingAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();
  const result = parsePostingInput(formData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const id = await createJobPosting(result.data, session.userId);
  revalidatePath("/admin/jobs");
  redirect(`/admin/jobs/${id}`);
}

export async function updateJobPostingAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();
  const id = Number(formData.get("id"));
  const result = parsePostingInput(formData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  await updateJobPosting(id, result.data, session.userId);
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${id}`);
  redirect(`/admin/jobs/${id}`);
}

export async function publishJobPostingAction(formData: FormData) {
  const session = await verifySession();
  const id = Number(formData.get("id"));
  await setJobPostingStatus(id, "open", session.userId);
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${id}`);
  revalidatePath("/careers");
}

export async function closeJobPostingAction(formData: FormData) {
  const session = await verifySession();
  const id = Number(formData.get("id"));
  await setJobPostingStatus(id, "closed", session.userId);
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${id}`);
  revalidatePath("/careers");
}

export async function deleteJobPostingAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const session = await verifySession();
  const id = Number(formData.get("id"));

  const { error } = await deleteJobPosting(id, session.userId);
  if (error) {
    return { error };
  }

  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

export async function updateApplicantStatusAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = updateApplicantStatusSchema.safeParse({
    applicantId: formData.get("applicantId"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined,
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const applicant = await updateApplicantStatus({
    applicantId: result.data.applicantId,
    status: result.data.status,
    notes: result.data.notes,
    staffId: session.userId,
  });

  if (result.data.status === "interview" || result.data.status === "offer" || result.data.status === "rejected") {
    await sendJobApplicationStatusEmail(
      applicant.email,
      applicant.fullName,
      applicant.jobPostingTitle,
      result.data.status
    ).catch(() => {
      // Status change already saved -- a flaky SMTP send shouldn't block the pipeline.
    });
  }

  const jobPostingId = formData.get("jobPostingId");
  revalidatePath(`/admin/jobs/${jobPostingId}`);
  revalidatePath(`/admin/jobs/${jobPostingId}/applicants/${result.data.applicantId}`);
  return { success: true };
}
