"use server";
import { jobAlertSignupSchema } from "@/lib/validation";
import { subscribeToJobAlerts } from "@/lib/job-alerts";

export async function subscribeToJobAlertsAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const result = jobAlertSignupSchema.safeParse({
    email: formData.get("email"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Please enter a valid email." };
  }

  await subscribeToJobAlerts(result.data.email);
  return { success: true };
}
