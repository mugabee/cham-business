"use client";
import { useState } from "react";
import { company, videoInterviewQuestions } from "@/lib/site";

export default function JobApplicationForm({
  jobPostingId,
  jobTitle,
}: {
  jobPostingId: number;
  jobTitle: string;
}) {
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
    const whatsappMessage = `Hi, I'm sending my video interview answers for the ${jobTitle} position. My name is ${fullName}.`;
    const whatsappUrl = `https://wa.me/${company.whatsapp.replace("+", "")}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
      <div className="rounded-3xl border border-[var(--color-line)] bg-white p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-brand-wash)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold text-[var(--color-ink)]">Application received</h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--color-ink-soft)]">
          Thank you for applying. We've emailed you a confirmation.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-deep)] p-6 text-left">
          <p className="font-semibold text-[var(--color-ink)]">One more step: a short video</p>
          <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
            Record yourself answering these 4 questions, then send the video to us on WhatsApp.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-[var(--color-ink)]">
            {videoInterviewQuestions.map((q, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="font-semibold text-[var(--color-brand)]">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#1ebe5d]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="h-5 w-5 fill-white">
              <path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.4 2 7.7L.3 31.6l8.2-2.1A15.6 15.6 0 0 0 16 31.6C24.6 31.6 31.6 24.6 31.6 16S24.6.4 16 .4zm0 28.4a13 13 0 0 1-6.6-1.8l-.5-.3-4.9 1.3 1.3-4.7-.3-.5A13 13 0 1 1 16 28.8zm7.1-9.7c-.4-.2-2.3-1.1-2.6-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.2 1.5-.2.2-.5.3-.9.1a11 11 0 0 1-3.2-2 12 12 0 0 1-2.2-2.8c-.2-.4 0-.6.2-.8l.6-.7.4-.7v-.7l-1.2-2.9c-.3-.7-.6-.6-.9-.6h-.7c-.3 0-.7.1-1 .4-.4.4-1.4 1.4-1.4 3.3 0 2 1.5 3.9 1.7 4.1.2.3 2.9 4.4 7 6.2 1 .4 1.7.7 2.3.9.97.3 1.86.26 2.56.16.78-.12 2.3-.94 2.63-1.85.32-.9.32-1.68.22-1.85-.1-.16-.33-.26-.7-.46z" />
            </svg>
            Send video on WhatsApp
          </a>
        </div>
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
      <p className="rounded-xl bg-[var(--color-brand-wash)] px-4 py-3 text-sm text-[var(--color-brand-deep)]">
        After you apply, we'll ask you to answer 4 short questions on video and send it to us on WhatsApp.
      </p>

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
