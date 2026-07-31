"use client";
import { useActionState, useState } from "react";
import { requestPortalLoginAction, verifyPortalLoginAction } from "@/app/actions/portal-auth";

export default function PortalLoginForm() {
  const [email, setEmail] = useState("");
  const [requestState, requestAction, requestPending] = useActionState(requestPortalLoginAction, undefined);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyPortalLoginAction, undefined);

  const field =
    "w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-soft";
  const label = "block text-sm font-medium text-ink mb-1";

  if (requestState?.success) {
    return (
      <form action={verifyAction} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <p className="text-sm text-ink-soft">
          We sent a 6-digit code to <strong>{email}</strong> (if it's on file).
        </p>
        <div>
          <label htmlFor="code" className={label}>Verification code</label>
          <input
            id="code"
            name="code"
            required
            maxLength={6}
            inputMode="numeric"
            className={`${field} tracking-[0.5em] text-center text-lg`}
            placeholder="000000"
          />
        </div>
        {verifyState?.error && <p className="text-sm text-red-600">{verifyState.error}</p>}
        <button
          type="submit"
          disabled={verifyPending}
          className="w-full rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium py-2.5 transition-colors"
        >
          {verifyPending ? "Verifying…" : "Log in"}
        </button>
      </form>
    );
  }

  return (
    <form action={requestAction} className="space-y-4">
      <div>
        <label htmlFor="email" className={label}>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          className={field}
          placeholder="you@example.com"
        />
      </div>
      {requestState?.error && <p className="text-sm text-red-600">{requestState.error}</p>}
      <button
        type="submit"
        disabled={requestPending}
        className="w-full rounded-lg bg-brand hover:bg-brand-deep disabled:opacity-60 text-white text-sm font-medium py-2.5 transition-colors"
      >
        {requestPending ? "Sending…" : "Send login code"}
      </button>
      <p className="text-xs text-ink-soft/70 text-center">
        Use the same email you applied with.
      </p>
    </form>
  );
}
