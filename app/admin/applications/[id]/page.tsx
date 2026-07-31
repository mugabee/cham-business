import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getApplicationById } from "@/lib/applications";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import ArchiveDeleteControls from "@/components/admin/ArchiveDeleteControls";
import { deleteApplicationAction } from "@/app/actions/applications";
import ApplicationActions from "./ApplicationActions";
import StaffApplicationDetailsForm from "@/components/admin/StaffApplicationDetailsForm";

const statusTone = {
  new: "warning",
  reviewing: "neutral",
  approved: "success",
  rejected: "danger",
} as const;

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifySession();
  const { id } = await params;
  const application = await getApplicationById(Number(id));

  if (!application) notFound();

  const isPending = application.status === "new" || application.status === "reviewing";

  return (
    <div className="max-w-3xl">
      <Link href="/admin/applications" className="text-sm text-brand hover:underline">
        ← Back to applications
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">{application.fullName}</h1>
        <div className="flex items-center gap-3">
          {isPending && (
            <Link
              href={`/admin/applications/${application.id}/edit`}
              className="rounded-lg border border-line hover:bg-paper-deep text-ink text-sm font-medium px-4 py-2 transition-colors"
            >
              Edit
            </Link>
          )}
          <StatusBadge label={application.status} tone={statusTone[application.status]} />
          {application.archivedAt && <StatusBadge label="archived" tone="neutral" />}
        </div>
      </div>

      <div className="mt-3">
        <ArchiveDeleteControls
          entity="application"
          id={application.id}
          archived={Boolean(application.archivedAt)}
          confirmMessage={`Permanently delete this application from ${application.fullName}? This cannot be undone.`}
          deleteAction={deleteApplicationAction}
          deleteDisabled={application.status === "approved"}
          deleteDisabledReason="Already approved -- delete the linked loan first if needed."
        />
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-line p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-ink-soft">Phone</p>
          <p className="text-ink">{application.phone}</p>
        </div>
        <div>
          <p className="text-ink-soft">Email</p>
          <p className="text-ink">{application.email || "—"}</p>
        </div>
        <div>
          <p className="text-ink-soft">Loan type</p>
          <p className="text-ink">{application.loanType}</p>
        </div>
        <div>
          <p className="text-ink-soft">Amount requested</p>
          <p className="text-ink">{formatRWF(application.amountRequested)}</p>
        </div>
        <div>
          <p className="text-ink-soft">Monthly income</p>
          <p className="text-ink">{formatRWF(application.monthlyIncome)}</p>
        </div>
        <div>
          <p className="text-ink-soft">Desired repayment period</p>
          <p className="text-ink">
            {application.desiredTermMonths ? `${application.desiredTermMonths} months` : "—"}
          </p>
        </div>
        <div>
          <p className="text-ink-soft">Occupation</p>
          <p className="text-ink">{application.occupation || "—"}</p>
        </div>
        <div>
          <p className="text-ink-soft">Marital status</p>
          <p className="text-ink capitalize">{application.maritalStatus || "—"}</p>
        </div>
        <div>
          <p className="text-ink-soft">Works from</p>
          <p className="text-ink">{application.workAddress || "—"}</p>
        </div>
        <div>
          <p className="text-ink-soft">Collateral location</p>
          <p className="text-ink">{application.collateralAddress || "—"}</p>
        </div>
        <div>
          <p className="text-ink-soft">Application fee</p>
          <p className="text-ink">
            {application.feeAmount ? formatRWF(application.feeAmount) : "—"}
          </p>
        </div>
        <div>
          <p className="text-ink-soft">Submitted</p>
          <p className="text-ink">{formatDate(application.submittedAt)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-ink-soft">Loan purpose{application.purposeCategory ? ` — ${application.purposeCategory}` : ""}</p>
          <p className="text-ink">{application.purpose}</p>
        </div>
        {application.borrowerId && (
          <div className="col-span-2">
            <p className="text-ink-soft">Linked borrower</p>
            <Link
              href={`/admin/borrowers/${application.borrowerId}`}
              className="text-brand hover:underline"
            >
              View borrower profile →
            </Link>
          </div>
        )}
        {application.notes && (
          <div className="col-span-2">
            <p className="text-ink-soft">Notes</p>
            <p className="text-ink">{application.notes}</p>
          </div>
        )}
        {application.reviewedByEmail && (
          <div className="col-span-2 text-ink-soft">
            Reviewed by {application.reviewedByEmail} on{" "}
            {application.reviewedAt ? formatDate(application.reviewedAt) : ""}
          </div>
        )}
      </div>

      {application.documents.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-line p-5">
          <h2 className="font-semibold text-ink mb-3">Supporting documents</h2>
          <ul className="divide-y divide-line text-sm">
            {application.documents.map((doc) => (
              <li key={doc.id} className="py-2 flex items-center justify-between">
                <span className="text-ink">{doc.originalFilename}</span>
                <a
                  href={`/api/admin/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline font-medium"
                >
                  View →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isPending && (
        <div className="mt-6">
          <ApplicationActions
            applicationId={application.id}
            amountRequested={application.amountRequested}
            isNewBorrower={!application.borrowerId}
          />
        </div>
      )}

      {application.status === "approved" && !application.occupation && (
        <div className="mt-6">
          <StaffApplicationDetailsForm
            applicationId={application.id}
            loanType={application.loanType}
            alreadyUploadedTypes={application.documents.map((d) => d.documentType)}
          />
        </div>
      )}
    </div>
  );
}
