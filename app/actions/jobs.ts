"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import {
  createJobPosting,
  updateJobPosting,
  setJobPostingStatus,
  deleteJobPosting,
  getJobPostingById,
} from "@/lib/jobs";
import {
  updateApplicantStatus,
  setApplicantRating,
  bulkUpdateApplicantStatus,
  getJobApplicantById,
  markInterviewEmailSent,
} from "@/lib/job-applicants";
import { listActiveJobAlertSubscribers } from "@/lib/job-alerts";
import {
  jobPostingSchema,
  updateApplicantStatusSchema,
  setApplicantRatingSchema,
  bulkUpdateApplicantStatusSchema,
  sendInterviewEmailSchema,
} from "@/lib/validation";
import {
  sendJobInterviewInviteEmail,
  sendJobOfferEmail,
  sendJobApplicationRejectedEmail,
  sendNewJobAlertEmail,
  sendCustomStaffEmail,
} from "@/lib/mailer";

function sendApplicantStatusEmail(
  status: "interview" | "offer" | "rejected",
  email: string,
  fullName: string,
  jobPostingTitle: string
) {
  if (status === "interview") return sendJobInterviewInviteEmail(email, fullName, jobPostingTitle);
  if (status === "offer") return sendJobOfferEmail(email, fullName, jobPostingTitle);
  return sendJobApplicationRejectedEmail(email, fullName, jobPostingTitle);
}

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
  const wasAlreadyOpenBefore = (await getJobPostingById(id))?.status === "open";
  await setJobPostingStatus(id, "open", session.userId);
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${id}`);
  revalidatePath("/careers");

  if (!wasAlreadyOpenBefore) {
    const posting = await getJobPostingById(id);
    if (posting) {
      const jobUrl = `${process.env.APP_URL}/careers/${posting.slug}`;
      const subscribers = await listActiveJobAlertSubscribers();
      await Promise.all(
        subscribers.map((s) =>
          sendNewJobAlertEmail(s.email, posting.title, jobUrl, s.unsubscribeToken).catch(() => {
            // One flaky send shouldn't block the others or the publish itself.
          })
        )
      );
    }
  }
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
    await sendApplicantStatusEmail(
      result.data.status,
      applicant.email,
      applicant.fullName,
      applicant.jobPostingTitle
    ).catch(() => {
      // Status change already saved -- a flaky SMTP send shouldn't block the pipeline.
    });
  }

  const jobPostingId = formData.get("jobPostingId");
  revalidatePath(`/admin/jobs/${jobPostingId}`);
  revalidatePath(`/admin/jobs/${jobPostingId}/applicants/${result.data.applicantId}`);
  return { success: true };
}

export async function setApplicantRatingAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = setApplicantRatingSchema.safeParse({
    applicantId: formData.get("applicantId"),
    rating: formData.get("rating"),
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  await setApplicantRating(result.data.applicantId, result.data.rating, session.userId);

  const jobPostingId = formData.get("jobPostingId");
  revalidatePath(`/admin/jobs/${jobPostingId}/applicants/${result.data.applicantId}`);
  revalidatePath("/admin/jobs/applicants");
  return { success: true };
}

export async function sendInterviewEmailAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = sendInterviewEmailSchema.safeParse({
    applicantId: formData.get("applicantId"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const applicant = await getJobApplicantById(result.data.applicantId);
  if (!applicant) {
    return { error: "Applicant not found." };
  }

  try {
    await sendCustomStaffEmail(applicant.email, result.data.subject, result.data.body, "careers@chambusiness.org");
  } catch {
    return { error: "Couldn't send the email. Please try again." };
  }

  await markInterviewEmailSent(result.data.applicantId, session.userId);

  revalidatePath(`/admin/jobs/${applicant.jobPostingId}`);
  revalidatePath(`/admin/jobs/${applicant.jobPostingId}/applicants/${result.data.applicantId}`);
  revalidatePath("/admin/jobs/applicants");

  return { success: true };
}

export async function bulkUpdateApplicantStatusAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const session = await verifySession();

  const result = bulkUpdateApplicantStatusSchema.safeParse({
    applicantIds: formData.getAll("applicantIds"),
    status: formData.get("status"),
  });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid submission." };
  }

  const updated = await bulkUpdateApplicantStatus({
    applicantIds: result.data.applicantIds,
    status: result.data.status,
    staffId: session.userId,
  });

  if (result.data.status === "interview" || result.data.status === "offer" || result.data.status === "rejected") {
    const status = result.data.status;
    await Promise.all(
      updated.map((applicant) =>
        sendApplicantStatusEmail(status, applicant.email, applicant.fullName, applicant.jobPostingTitle).catch(() => {
          // Status changes already saved -- a flaky SMTP send shouldn't block the pipeline.
        })
      )
    );
  }

  revalidatePath("/admin/jobs/applicants");
  return { success: true };
}
