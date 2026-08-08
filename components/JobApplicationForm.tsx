"use client";
import { useState } from "react";

export default function JobApplicationForm({ jobPostingId }: { jobPostingId: number }) {
  const [stage, setStage] = useState<"form" | "otp" | "done">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [serverError, setServerError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const field =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-brand)]";
  const label = "block text-sm font-semibold text-[var(--color-ink)]";
  const errText = "mt-1 text-sm text-[var(--color-accent-deep)]";

  async function requestCode() {
    setServerError("");
    if (!fullName.trim() || !email.trim() || !phone.trim() || !resumeFile) {
      setServerError("Please fill in your details and attach your resume before requesting a code.");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/careers/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
    if (!resumeFile) {
      setServerError("Please attach your resume/CV.");
      setStage("form");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("jobPostingId", String(jobPostingId));
      formData.set("fullName", fullName);
      formData.set("email", email);
      formData.set("phone", phone);
      if (coverLetter) formData.set("coverLetter", coverLetter);
      formData.set("resume", resumeFile);
      formData.set("otpCode", otpCode);

      const res = await fetch("/api/careers/apply", { method: "POST", body: formData });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Something went wrong");
      setStage("done");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
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
        <h2 className="mt-5 font-display text-2xl font-bold text-[var(--color-ink)]">Application received</h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--color-ink-soft)]">
          Thank you for applying. We've emailed you a confirmation, and our team will be in touch if we'd
          like to move forward.
        </p>
      </div>
    );
  }

  if (stage === "otp") {
    return (
      <div className="space-y-5">
        <p className="text-[var(--color-ink-soft)]">
          We sent a 6-digit verification code to <strong>{email}</strong>. Enter it below to confirm
          this is your email and submit your application.
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
          disabled={submitting}
          className="w-full rounded-full bg-[var(--color-brand)] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)] disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Verify & submit application"}
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
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className={`${field} mt-1.5`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={label}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`${field} mt-1.5`}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className={label}>Phone number</label>
          <input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={`${field} mt-1.5`}
            placeholder="+250 ..."
          />
        </div>
      </div>

      <div>
        <label htmlFor="resume" className={label}>Resume / CV</label>
        <input
          id="resume"
          type="file"
          required
          accept=".pdf,.doc,.docx,image/jpeg,image/png"
          onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
          className={`${field} mt-1.5`}
        />
        <p className="mt-1 text-xs text-[var(--color-ink-soft)]">PDF, Word, or image, up to 5MB.</p>
      </div>

      <div>
        <label htmlFor="coverLetter" className={label}>
          Cover letter <span className="font-normal text-[var(--color-ink-soft)]">(optional)</span>
        </label>
        <textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={5}
          maxLength={3000}
          className={`${field} mt-1.5`}
        />
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
        We&apos;ll email you a 6-digit code to confirm it&apos;s really you before your application is submitted.
      </p>
    </form>
  );
}
