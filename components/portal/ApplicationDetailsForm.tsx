"use client";
import { useActionState, useState } from "react";
import { completeApplicationDetailsAction } from "@/app/actions/portal-applications";
import { visibleDocumentTypes, PURPOSE_CATEGORIES } from "@/lib/documents";

export default function ApplicationDetailsForm({
  applicationId,
  loanType,
  alreadyUploadedTypes,
}: {
  applicationId: number;
  loanType: string;
  alreadyUploadedTypes: string[];
}) {
  const [state, action, pending] = useActionState(completeApplicationDetailsAction, undefined);
  const [maritalStatus, setMaritalStatus] = useState("");

  const documents = visibleDocumentTypes(loanType, maritalStatus).filter(
    (doc) => !alreadyUploadedTypes.includes(doc.key)
  );

  const field =
    "w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";
  const fileField = `${field} file:mr-3 file:rounded file:border-0 file:bg-brand-wash file:px-2 file:py-1 file:text-xs file:font-medium file:text-brand`;

  return (
    <form action={action} className="bg-white rounded-2xl border border-line p-5 space-y-4">
      <input type="hidden" name="applicationId" value={applicationId} />

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
        <textarea name="purpose" rows={3} required className={field} placeholder="A sentence or two is fine" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Repayment period (months)</label>
          <input name="desiredTermMonths" type="number" min={1} required className={field} />
        </div>
        <div>
          <label className={label}>Occupation</label>
          <input name="occupation" required className={field} placeholder="e.g. Market trader" />
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
          <label className={label}>Where do you work from?</label>
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
                className={`${fileField} mt-1`}
              />
            </div>
          ))}
        </div>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 transition-colors"
      >
        {pending ? "Saving…" : "Save & submit"}
      </button>
    </form>
  );
}
