import { z } from "zod";

// Application form schema. Kept lean on purpose — collect only what's needed.
export const applicationSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[0-9+\s-]+$/, "Phone can only contain numbers"),
  email: z.string().email("Please enter a valid email").or(z.literal("")),
  loanType: z.string().min(1, "Please choose a loan type"),
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .regex(/^[0-9,]+$/, "Amount can only contain numbers"),
  purpose: z.string().min(5, "Tell us briefly what it's for"),
  monthlyIncome: z
    .string()
    .min(1, "Please enter your monthly income")
    .regex(/^[0-9,]+$/, "Income can only contain numbers"),
  consent: z.literal(true, {
    message: "Please agree so we can process your application",
  }),
});

export type ApplicationData = z.infer<typeof applicationSchema>;

// Staff auth schemas.
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

export const requestResetSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Admin back-office schemas.

export const approveApplicationSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  principal: z.coerce.number().int().positive("Enter the approved amount"),
  termMonths: z.coerce.number().int().min(1).max(60, "Term must be 1-60 months"),
  disbursedAt: z.string().min(1, "Pick a disbursement date"),
  nationalId: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const updateApplicationSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  fullName: z.string().min(2, "Enter the applicant's full name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  loanType: z.string().min(1, "Choose a loan type"),
  amountRequested: z.coerce.number().int().positive("Enter the amount requested"),
  monthlyIncome: z.coerce.number().int().nonnegative(),
  purpose: z.string().min(5, "Tell us briefly what it's for"),
});

export const rejectApplicationSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  notes: z.string().min(1, "Add a short reason for the applicant's file"),
});

export const borrowerSchema = z.object({
  fullName: z.string().min(2, "Enter the borrower's full name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  nationalId: z.string().optional(),
  monthlyIncome: z.coerce.number().int().nonnegative(),
  address: z.string().optional(),
});

export const createLoanSchema = z.object({
  borrowerId: z.coerce.number().int().positive(),
  principal: z.coerce.number().int().positive("Enter the loan amount"),
  termMonths: z.coerce.number().int().min(1).max(60, "Term must be 1-60 months"),
  disbursedAt: z.string().min(1, "Pick a disbursement date"),
});

export const restructureLoanSchema = z.object({
  loanId: z.coerce.number().int().positive(),
  newTermMonths: z.coerce.number().int().min(1).max(60, "Term must be 1-60 months"),
  newMonthlyRatePercent: z.coerce.number().min(0).max(100).optional(),
  effectiveDate: z.string().min(1, "Pick an effective date"),
});

export const updatePaymentSchema = z.object({
  paymentId: z.coerce.number().int().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  loanId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int().positive("Enter the amount paid"),
  method: z.enum(["mtn", "airtel", "bank"], {
    message: "Choose a payment method",
  }),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
