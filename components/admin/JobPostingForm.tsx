"use client";
import { useActionState } from "react";
import { EMPLOYMENT_TYPE_LABELS, type JobPostingDetail } from "@/lib/job-types";

type ActionState = { error?: string } | undefined;
type PostingAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export default function JobPostingForm({
  action,
  posting,
}: {
  action: PostingAction;
  posting?: JobPostingDetail;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const field =
    "w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";

  return (
    <form action={formAction} className="bg-white rounded-2xl border border-line p-5 space-y-4">
      {posting && <input type="hidden" name="id" value={posting.id} />}

      <div>
        <label className={label}>Job title</label>
        <input name="title" required defaultValue={posting?.title} className={field} placeholder="e.g. Loan Officer" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>
            Department <span className="font-normal text-ink-soft">(optional)</span>
          </label>
          <input name="department" defaultValue={posting?.department ?? ""} className={field} placeholder="e.g. Loan Operations" />
        </div>
        <div>
          <label className={label}>Employment type</label>
          <select name="employmentType" required defaultValue={posting?.employmentType ?? ""} className={field}>
            <option value="" disabled>Choose one</option>
            {Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, labelText]) => (
              <option key={value} value={value}>{labelText}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Location</label>
        <input name="location" required defaultValue={posting?.location} className={field} placeholder="e.g. Kicukiro, Kigali" />
      </div>

      <div>
        <label className={label}>Summary</label>
        <textarea
          name="summary"
          required
          rows={2}
          maxLength={500}
          defaultValue={posting?.summary}
          className={field}
          placeholder="One or two lines shown on the careers listing page"
        />
      </div>

      <div>
        <label className={label}>Full description</label>
        <textarea name="description" required rows={6} defaultValue={posting?.description} className={field} />
      </div>

      <div>
        <label className={label}>Requirements</label>
        <textarea
          name="requirements"
          required
          rows={5}
          defaultValue={posting?.requirements}
          className={field}
          placeholder="One requirement per line"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        {pending ? "Saving…" : posting ? "Save changes" : "Create posting (as draft)"}
      </button>
    </form>
  );
}
