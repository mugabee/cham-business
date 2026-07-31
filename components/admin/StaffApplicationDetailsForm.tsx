"use client";
import { useActionState, useState } from "react";
import { completeApplicationDetailsByStaffAction } from "@/app/actions/applications";
import { visibleDocumentTypes, PURPOSE_CATEGORIES } from "@/lib/documents";

export default function StaffApplicationDetailsForm({
  applicationId,
  loanType,
  alreadyUploadedTypes,
}: {
  applicationId: number;
  loanType: string;
  alreadyUploadedTypes: string[];
}) {
  const [state, action, pending] = useActionState(completeApplicationDetailsByStaffAction, undefined);
  const [maritalStatus, setMaritalStatus] = useState("");

  const documents = visibleDocumentTypes(loanType, maritalStatus).filter(
    (doc) => !alreadyUploadedTypes.includes(doc.key)
  );

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";

  if (state?.success) {
    return (
      <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        Saved.
      </p>
    );
  }

  return (
    <form action={action} className="bg-white rounded-2xl border border-line p-5 space-y-4">
      <input type="hidden" name="applicationId" value={applicationId} />
      <h2 className="font-semibold text-ink">Complete applicant details</h2>
      <p className="text-xs text-ink-soft">
        For applicants who can&apos;t or prefer not to fill this in online themselves.
      </p>

      <div>
        <label className={label}>What will the loan be used for?</label>
        <select name="purposeCategory" required defaultValue="" className={field}>
          <option value="" disabled>Choose one</option>
          {PURPOSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={label}>Tell us more</label>
        <textarea name="purpose" rows={3} required className={field} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Repayment period (months)</label>
          <input name="desiredTermMonths" type="number" min={1} required className={field} />
        </div>
        <div>
          <label className={label}>Occupation</label>
          <input name="occupation" required className={field} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Marital status</label>
          <select
            name="maritalStatus"
            required
            defaultValue=""
            onChange={(e) => setMaritalStatus(e.target.value)}
            className={field}
          >
            <option value="" disabled>Choose one</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
          </select>
        </div>
        <div>
          <label className={label}>Works from</label>
          <input name="workAddress" required className={field} />
        </div>
      </div>

      <div>
        <label className={label}>
          Collateral location <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input name="collateralAddress" className={field} />
      </div>

      {documents.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-line">
          <p className={label}>Supporting documents</p>
          {documents.map((doc) => (
            <div key={doc.key}>
              <label className="block text-sm text-ink">
                {doc.label}
                {!doc.required && <span className="font-normal text-ink-soft"> (optional)</span>}
              </label>
              <input
                name={doc.key}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                required={doc.required}
                className={`${field} mt-1`}
              />
            </div>
          ))}
        </div>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}
