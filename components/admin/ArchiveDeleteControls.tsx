"use client";
import { useActionState } from "react";
import { archiveAction, restoreAction } from "@/app/actions/archive";

type ActionState = { error?: string; success?: boolean } | undefined;
type DeleteAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export default function ArchiveDeleteControls({
  entity,
  id,
  archived,
  confirmMessage,
  deleteAction,
  deleteDisabled,
  deleteDisabledReason,
  extraFields,
}: {
  entity: "application" | "borrower" | "loan" | "payment";
  id: number;
  archived: boolean;
  confirmMessage: string;
  deleteAction: DeleteAction;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
  extraFields?: Record<string, string | number>;
}) {
  const [archiveState, archiveFormAction, archivePending] = useActionState(
    archiveAction,
    undefined
  );
  const [restoreState, restoreFormAction, restorePending] = useActionState(
    restoreAction,
    undefined
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteAction,
    undefined
  );

  function handleDeleteSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  }

  const error = archiveState?.error || restoreState?.error || deleteState?.error;

  return (
    <div className="flex items-center gap-3">
      {archived ? (
        <form action={restoreFormAction}>
          <input type="hidden" name="entity" value={entity} />
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            disabled={restorePending}
            className="text-xs font-medium text-amber-700 hover:underline disabled:opacity-50"
          >
            {restorePending ? "Restoring…" : "Restore"}
          </button>
        </form>
      ) : (
        <form action={archiveFormAction}>
          <input type="hidden" name="entity" value={entity} />
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            disabled={archivePending}
            className="text-xs font-medium text-gray-500 hover:underline disabled:opacity-50"
          >
            {archivePending ? "Archiving…" : "Archive"}
          </button>
        </form>
      )}

      <form action={deleteFormAction} onSubmit={handleDeleteSubmit}>
        <input type="hidden" name="id" value={id} />
        {extraFields &&
          Object.entries(extraFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        <button
          type="submit"
          disabled={deletePending || deleteDisabled}
          title={deleteDisabled ? deleteDisabledReason : undefined}
          className="text-xs font-medium text-red-600 hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:no-underline"
        >
          {deletePending ? "Deleting…" : "Delete permanently"}
        </button>
      </form>

      {error && <span className="text-xs text-red-600">{error}</span>}
      {!deletePending && deleteDisabled && deleteDisabledReason && (
        <span className="text-xs text-gray-400">{deleteDisabledReason}</span>
      )}
    </div>
  );
}
