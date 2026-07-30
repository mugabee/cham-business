"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { applicationSchema, type ApplicationData } from "@/lib/validation";
import { loanProducts } from "@/lib/site";

export default function ApplyForm() {
  const [stage, setStage] = useState<"form" | "otp" | "done">("form");
  const [otpCode, setOtpCode] = useState("");
  const [serverError, setServerError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
  });

  async function requestCode() {
    setServerError("");
    const valid = await trigger();
    if (!valid) return;

    setSendingOtp(true);
    try {
      const res = await fetch("/api/apply/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: getValues("email") }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Couldn't send a code. Please try again.");
      setStage("otp");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Couldn't send a code. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  }

  async function verifyAndSubmit() {
    setServerError("");
    if (otpCode.trim().length !== 6) {
      setServerError("Enter the 6-digit code we emailed you.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...getValues(), otpCode }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Something went wrong");
      setStage("done");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  if (stage === "done") {
    return (
      <div className="rounded-3xl border border-[var(--color-line)] bg-white p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-brand-wash)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-[var(--color-ink)]">
          Application received
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--color-ink-soft)]">
          Thank you. Check your email for a link to your account, where you can
          finish your application (a few more details and your documents) and
          later track your loan and payments.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-brand)]";
  const label = "block text-sm font-semibold text-[var(--color-ink)]";
  const errText = "mt-1 text-sm text-[var(--color-accent-deep)]";

  if (stage === "otp") {
    return (
      <div className="space-y-5">
        <p className="text-[var(--color-ink-soft)]">
          We sent a 6-digit verification code to <strong>{getValues("email")}</strong>.
          Enter it below to confirm this is your email and submit your application.
        </p>
        <div>
          <label htmlFor="otpCode" className={label}>Verification code</label>
          <input
            id="otpCode"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            inputMode="numeric"
            className={`${field} mt-1.5 tracking-[0.5em] text-center text-xl`}
            placeholder="000000"
            maxLength={6}
          />
        </div>

        {serverError && (
          <p className="rounded-xl bg-[var(--color-accent)]/15 px-4 py-3 text-sm text-[var(--color-accent-deep)]">
            {serverError}
          </p>
        )}

        <button
          type="button"
          onClick={verifyAndSubmit}
          disabled={verifying}
          className="w-full rounded-full bg-[var(--color-brand)] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)] disabled:opacity-60"
        >
          {verifying ? "Verifying..." : "Verify & submit application"}
        </button>

        <div className="flex justify-between text-sm">
          <button type="button" onClick={() => setStage("form")} className="text-[var(--color-ink-soft)] hover:underline">
            ← Change details
          </button>
          <button type="button" onClick={requestCode} disabled={sendingOtp} className="text-[var(--color-brand)] hover:underline">
            {sendingOtp ? "Sending..." : "Resend code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); requestCode(); }} className="space-y-5" noValidate>
      <div>
        <label htmlFor="fullName" className={label}>Full name</label>
        <input id="fullName" {...register("fullName")} className={`${field} mt-1.5`} placeholder="As it appears on your ID" />
        {errors.fullName && <p className={errText}>{errors.fullName.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={label}>Phone number</label>
          <input id="phone" {...register("phone")} className={`${field} mt-1.5`} placeholder="+250 ..." />
          {errors.phone && <p className={errText}>{errors.phone.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input id="email" {...register("email")} className={`${field} mt-1.5`} placeholder="you@example.com" />
          {errors.email && <p className={errText}>{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="loanType" className={label}>Loan type</label>
          <select id="loanType" {...register("loanType")} className={`${field} mt-1.5`} defaultValue="">
            <option value="" disabled>Choose one</option>
            {loanProducts.map((l) => (
              <option key={l.slug} value={l.name}>{l.name}</option>
            ))}
          </select>
          {errors.loanType && <p className={errText}>{errors.loanType.message}</p>}
        </div>
        <div>
          <label htmlFor="amount" className={label}>Amount needed (RWF)</label>
          <input id="amount" {...register("amount")} className={`${field} mt-1.5`} placeholder="e.g. 500,000" />
          {errors.amount && <p className={errText}>{errors.amount.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="monthlyIncome" className={label}>Monthly income (RWF)</label>
        <input id="monthlyIncome" {...register("monthlyIncome")} className={`${field} mt-1.5`} placeholder="e.g. 350,000" />
        {errors.monthlyIncome && <p className={errText}>{errors.monthlyIncome.message}</p>}
      </div>

      <div className="rounded-xl bg-[var(--color-paper-deep)] p-4">
        <label className="flex gap-3 text-sm text-[var(--color-ink-soft)]">
          <input type="checkbox" {...register("consent")} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand)]" />
          <span>
            I agree that Cham Business Ltd may use the information above to assess
            and contact me about my application. I understand this is an enquiry,
            not a guarantee of a loan.
          </span>
        </label>
        {errors.consent && <p className={errText}>{errors.consent.message}</p>}
      </div>

      {serverError && (
        <p className="rounded-xl bg-[var(--color-accent)]/15 px-4 py-3 text-sm text-[var(--color-accent-deep)]">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={sendingOtp}
        className="w-full rounded-full bg-[var(--color-brand)] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)] disabled:opacity-60"
      >
        {sendingOtp ? "Sending code..." : "Send verification code"}
      </button>

      <p className="text-center text-xs text-[var(--color-ink-soft)]">
        We&apos;ll email you a 6-digit code to confirm it&apos;s really you before
        your application is submitted.
      </p>
    </form>
  );
}
