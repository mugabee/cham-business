import { notFound } from "next/navigation";
import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { getApplicationById } from "@/lib/applications";
import { formatRWF, formatDate } from "@/lib/format";
import StatusBadge from "@/components/admin/StatusBadge";
import ArchiveDeleteControls from "@/components/admin/ArchiveDeleteControls";
import { deleteApplicationAction } from "@/app/actions/applications";
import ApplicationActions from "./ApplicationActions";

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
      <Link href="/admin/applications" className="text-sm text-amber-700 hover:underline">
        ← Back to applications
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{application.fullName}</h1>
        <div className="flex items-center gap-3">
          {isPending && (
            <Link
              href={`/admin/applications/${application.id}/edit`}
              className="rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 transition-colors"
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

      <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Phone</p>
          <p className="text-gray-900">{application.phone}</p>
        </div>
        <div>
          <p className="text-gray-500">Email</p>
          <p className="text-gray-900">{application.email || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Loan type</p>
          <p className="text-gray-900">{application.loanType}</p>
        </div>
        <div>
          <p className="text-gray-500">Amount requested</p>
          <p className="text-gray-900">{formatRWF(application.amountRequested)}</p>
        </div>
        <div>
          <p className="text-gray-500">Monthly income</p>
          <p className="text-gray-900">{formatRWF(application.monthlyIncome)}</p>
        </div>
        <div>
          <p className="text-gray-500">Desired repayment period</p>
          <p className="text-gray-900">
            {application.desiredTermMonths ? `${application.desiredTermMonths} months` : "—"}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Occupation</p>
          <p className="text-gray-900">{application.occupation || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Marital status</p>
          <p className="text-gray-900 capitalize">{application.maritalStatus || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Works from</p>
          <p className="text-gray-900">{application.workAddress || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Collateral location</p>
          <p className="text-gray-900">{application.collateralAddress || "—"}</p>
        </div>
        <div>
          <p className="text-gray-500">Application fee</p>
          <p className="text-gray-900">
            {application.feeAmount ? formatRWF(application.feeAmount) : "—"}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Submitted</p>
          <p className="text-gray-900">{formatDate(application.submittedAt)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500">Loan purpose{application.purposeCategory ? ` — ${application.purposeCategory}` : ""}</p>
          <p className="text-gray-900">{application.purpose}</p>
        </div>
        {application.borrowerId && (
          <div className="col-span-2">
            <p className="text-gray-500">Linked borrower</p>
            <Link
              href={`/admin/borrowers/${application.borrowerId}`}
              className="text-amber-700 hover:underline"
            >
              View borrower profile →
            </Link>
          </div>
        )}
        {application.notes && (
          <div className="col-span-2">
            <p className="text-gray-500">Notes</p>
            <p className="text-gray-900">{application.notes}</p>
          </div>
        )}
        {application.reviewedByEmail && (
          <div className="col-span-2 text-gray-500">
            Reviewed by {application.reviewedByEmail} on{" "}
            {application.reviewedAt ? formatDate(application.reviewedAt) : ""}
          </div>
        )}
      </div>

      {application.documents.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Supporting documents</h2>
          <ul className="divide-y divide-gray-100 text-sm">
            {application.documents.map((doc) => (
              <li key={doc.id} className="py-2 flex items-center justify-between">
                <span className="text-gray-700">{doc.originalFilename}</span>
                <a
                  href={`/api/admin/documents/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:underline font-medium"
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
    </div>
  );
}
