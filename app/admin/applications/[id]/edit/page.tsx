import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getApplicationById } from "@/lib/applications";
import ApplicationEditForm from "./ApplicationEditForm";

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const application = await getApplicationById(Number(id));

  if (!application) notFound();
  if (application.status !== "new" && application.status !== "reviewing") {
    redirect(`/admin/applications/${application.id}`);
  }

  return (
    <div>
      <Link
        href={`/admin/applications/${application.id}`}
        className="text-sm text-brand hover:underline"
      >
        ← Back to application
      </Link>
      <h1 className="text-2xl font-semibold text-ink mt-3 mb-6">Edit {application.fullName}</h1>
      <ApplicationEditForm application={application} />
    </div>
  );
}
