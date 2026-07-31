import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { verifyBorrowerSession } from "@/lib/borrower-dal";
import { getApplicationForBorrower } from "@/lib/applications";
import { formatRWF } from "@/lib/format";
import ApplicationDetailsForm from "@/components/portal/ApplicationDetailsForm";

export const dynamic = "force-dynamic";

export default async function PortalApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifyBorrowerSession();
  const { id } = await params;
  const application = await getApplicationForBorrower(Number(id), session.borrowerId);

  if (!application) notFound();
  if (application.status !== "approved") {
    redirect("/portal");
  }

  return (
    <div>
      <Link href="/portal" className="text-sm text-brand hover:underline">
        ← Back
      </Link>
      <h1 className="text-2xl font-semibold text-ink mt-3 mb-1">Complete your application</h1>
      <p className="text-sm text-ink-soft mb-6">
        {application.loanType} — {formatRWF(application.amountRequested)}
      </p>
      <ApplicationDetailsForm
        applicationId={application.id}
        loanType={application.loanType}
        alreadyUploadedTypes={application.documents.map((d) => d.documentType)}
      />
    </div>
  );
}
