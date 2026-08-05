import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { createJobPostingAction } from "@/app/actions/jobs";
import JobPostingForm from "@/components/admin/JobPostingForm";

export default async function NewJobPostingPage() {
  await verifySession();

  return (
    <div className="max-w-2xl">
      <Link href="/admin/jobs" className="text-sm text-brand hover:underline">
        ← Back to jobs
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-ink mb-6">New job posting</h1>
      <JobPostingForm action={createJobPostingAction} />
    </div>
  );
}
