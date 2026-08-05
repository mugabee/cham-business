import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getJobPostingById } from "@/lib/jobs";
import { updateJobPostingAction } from "@/app/actions/jobs";
import JobPostingForm from "@/components/admin/JobPostingForm";

export default async function EditJobPostingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const posting = await getJobPostingById(Number(id));
  if (!posting) notFound();

  return (
    <div className="max-w-2xl">
      <Link href={`/admin/jobs/${posting.id}`} className="text-sm text-brand hover:underline">
        ← Back to posting
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-ink mb-6">Edit job posting</h1>
      <JobPostingForm action={updateJobPostingAction} posting={posting} />
    </div>
  );
}
