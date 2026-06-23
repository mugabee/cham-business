"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { applicationSchema, type ApplicationData } from "@/lib/validation";
import { loanProducts } from "@/lib/site";

export default function ApplyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
  });

  async function onSubmit(data: ApplicationData) {
    setServerError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Something went wrong");
      setSubmitted(true);
    } catch {
      setServerError(
        "We couldn't send your application just now. Please try again, or call us."
      );
    }
  }

  if (submitted) {
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
          Thank you. Our team will review your details and get back to you within
          24 hours, usually sooner. We may call to confirm a few things.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-brand)]";
  const label = "block text-sm font-semibold text-[var(--color-ink)]";
  const errText = "mt-1 text-sm text-[var(--color-accent-deep)]";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
          <label htmlFor="email" className={label}>Email <span className="font-normal text-[var(--color-ink-soft)]">(optional)</span></label>
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

      <div>
        <label htmlFor="purpose" className={label}>What is the loan for?</label>
        <textarea id="purpose" {...register("purpose")} rows={3} className={`${field} mt-1.5 resize-none`} placeholder="A sentence or two is fine" />
        {errors.purpose && <p className={errText}>{errors.purpose.message}</p>}
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
        disabled={isSubmitting}
        className="w-full rounded-full bg-[var(--color-brand)] px-6 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--color-brand-deep)] disabled:opacity-60"
      >
        {isSubmitting ? "Sending..." : "Submit application"}
      </button>

      <p className="text-center text-xs text-[var(--color-ink-soft)]">
        We never share your details with third parties for marketing. Your
        information is used only to process your application.
      </p>
    </form>
  );
}
