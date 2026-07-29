"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { applicationSchema, type ApplicationData } from "@/lib/validation";
import { loanProducts } from "@/lib/site";
import { visibleDocumentTypes, calculateApplicationFee, PURPOSE_CATEGORIES } from "@/lib/documents";

export default function ApplyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationData>({
    resolver: zodResolver(applicationSchema),
  });

  const loanType = watch("loanType");
  const maritalStatus = watch("maritalStatus");
  const amount = watch("amount");

  const numericAmount = Number((amount || "").replace(/,/g, ""));
  const fee = calculateApplicationFee(numericAmount);
  const documents = visibleDocumentTypes(loanType || "", maritalStatus);

  async function onSubmit(_data: ApplicationData, event?: React.BaseSyntheticEvent) {
    setServerError("");
    try {
      const form = (event?.target as HTMLFormElement) ?? formRef.current;
      if (!form) throw new Error("Form not found");
      const formData = new FormData(form);

      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong");
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err instanceof Error && err.message !== "Something went wrong"
          ? err.message
          : "We couldn't send your application just now. Please try again, or call us."
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
          24 hours, usually sooner. We may call to confirm a few things, including
          payment of the application fee shown above.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-3 text-[var(--color-ink)] outline-none transition-colors focus:border-[var(--color-brand)]";
  const label = "block text-sm font-semibold text-[var(--color-ink)]";
  const errText = "mt-1 text-sm text-[var(--color-accent-deep)]";
  const fileField = `${field} file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-brand-wash)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--color-brand)]`;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
      encType="multipart/form-data"
    >
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="monthlyIncome" className={label}>Monthly income (RWF)</label>
          <input id="monthlyIncome" {...register("monthlyIncome")} className={`${field} mt-1.5`} placeholder="e.g. 350,000" />
          {errors.monthlyIncome && <p className={errText}>{errors.monthlyIncome.message}</p>}
        </div>
        <div>
          <label htmlFor="desiredTermMonths" className={label}>For how long will the loan be repaid? (months)</label>
          <input id="desiredTermMonths" {...register("desiredTermMonths")} className={`${field} mt-1.5`} placeholder="e.g. 6" />
          {errors.desiredTermMonths && <p className={errText}>{errors.desiredTermMonths.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="purposeCategory" className={label}>What will the loan be used for?</label>
        <select id="purposeCategory" {...register("purposeCategory")} className={`${field} mt-1.5`} defaultValue="">
          <option value="" disabled>Choose one</option>
          {PURPOSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {errors.purposeCategory && <p className={errText}>{errors.purposeCategory.message}</p>}
      </div>

      <div>
        <label htmlFor="purpose" className={label}>
          Tell us more (or if you chose &ldquo;Other&rdquo; above)
        </label>
        <textarea id="purpose" {...register("purpose")} rows={3} className={`${field} mt-1.5 resize-none`} placeholder="A sentence or two is fine" />
        {errors.purpose && <p className={errText}>{errors.purpose.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="occupation" className={label}>What do you do? (occupation / job)</label>
          <input id="occupation" {...register("occupation")} className={`${field} mt-1.5`} placeholder="e.g. Market trader" />
          {errors.occupation && <p className={errText}>{errors.occupation.message}</p>}
        </div>
        <div>
          <label htmlFor="maritalStatus" className={label}>Marital status</label>
          <select id="maritalStatus" {...register("maritalStatus")} className={`${field} mt-1.5`} defaultValue="">
            <option value="" disabled>Choose one</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
          </select>
          {errors.maritalStatus && <p className={errText}>{errors.maritalStatus.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="workAddress" className={label}>Address where you work from</label>
        <input id="workAddress" {...register("workAddress")} className={`${field} mt-1.5`} placeholder="e.g. Kicukiro Modern Market, Kigali" />
        {errors.workAddress && <p className={errText}>{errors.workAddress.message}</p>}
      </div>

      <div>
        <label htmlFor="collateralAddress" className={label}>
          Collateral asset location/address <span className="font-normal text-[var(--color-ink-soft)]">(optional, if you're offering collateral)</span>
        </label>
        <input id="collateralAddress" {...register("collateralAddress")} className={`${field} mt-1.5`} placeholder="Where is the collateral located?" />
        {errors.collateralAddress && <p className={errText}>{errors.collateralAddress.message}</p>}
      </div>

      <div className="rounded-xl border border-[var(--color-line)] p-4">
        <p className="text-sm font-semibold text-[var(--color-ink)]">Application fee</p>
        <p className="mt-1 text-2xl font-bold text-[var(--color-brand)]">
          RWF {fee.toLocaleString()}
        </p>
        <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
          1% of the requested amount + 18% VAT, minimum RWF 30,000. Our team will
          contact you with payment instructions before your application is
          processed.
        </p>
      </div>

      <div className="space-y-4">
        <p className={label}>Supporting documents</p>
        {documents.map((doc) => (
          <div key={doc.key}>
            <label htmlFor={doc.key} className="block text-sm text-[var(--color-ink)]">
              {doc.label}
              {!doc.required && <span className="font-normal text-[var(--color-ink-soft)]"> (optional)</span>}
            </label>
            <input
              id={doc.key}
              name={doc.key}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              required={doc.required}
              className={`${fileField} mt-1.5`}
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-[var(--color-paper-deep)] p-4">
        <label className="flex gap-3 text-sm text-[var(--color-ink-soft)]">
          <input type="checkbox" {...register("consent")} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-brand)]" />
          <span>
            I agree to Cham Business Ltd&apos;s terms and conditions, understand
            the application fee shown above, and agree that my information may
            be used to assess and contact me about my application. I understand
            this is an enquiry, not a guarantee of a loan.
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
