import { z } from "zod";

// Public application form schema. Kept deliberately short -- everything
// else (occupation, marital status, addresses, documents) is filled in
// afterwards through the borrower portal, once the email is verified.
export const applicationSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[0-9+\s-]+$/, "Phone can only contain numbers"),
  email: z.string().email("Please enter a valid email"),
  loanType: z.string().min(1, "Please choose a loan type"),
  amount: z
    .string()
    .min(1, "Please enter an amount")
    .regex(/^[0-9,]+$/, "Amount can only contain numbers"),
  monthlyIncome: z
    .string()
    .min(1, "Please enter your monthly income")
    .regex(/^[0-9,]+$/, "Income can only contain numbers"),
  consent: z.literal(true, {
    message: "Please agree so we can process your application",
  }),
});

export type ApplicationData = z.infer<typeof applicationSchema>;

export const otpRequestSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

// Filled in by the borrower through the portal, once their application
// exists and their email is verified.
export const applicationDetailsSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
  purposeCategory: z.string().min(1, "Please choose what the loan is for"),
  purpose: z.string().min(5, "Tell us briefly what it's for"),
  desiredTermMonths: z
    .string()
    .min(1, "Please tell us how many months")
    .regex(/^[0-9]+$/, "Months must be a number"),
  occupation: z.string().min(1, "Please tell us your occupation"),
  maritalStatus: z.enum(["single", "married", "divorced"], {
    message: "Please choose your marital status",
  }),
  workAddress: z.string().min(1, "Please tell us where you work from"),
  collateralAddress: z.string().optional().or(z.literal("")),
});

export const paymentProofSchema = z.object({
  loanId: z.coerce.number().int().positive(),
  amountClaimed: z.coerce.number().int().positive("Enter the amount you paid"),
  method: z.enum(["mtn", "airtel", "bank"], {
    message: "Choose a payment method",
  }),
  reference: z.string().optional(),
});

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
  // Debt-to-income safeguard (BNR Reg 55/2022 Art 95-96): if the estimated
  // installment exceeds the warning threshold, the form re-submits with
  // this flag set once staff confirms they want to proceed anyway.
  overrideDti: z.string().optional(),
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

// Consumer-protection compliance schemas (penalties, guarantors,
// collateral, complaints, cooling-off cancellation).

export const applyPenaltySchema = z.object({
  loanId: z.coerce.number().int().positive(),
  amount: z.coerce.number().int().positive("Enter the penalty amount"),
  reason: z.string().min(3, "Explain why this penalty is being charged"),
});

export const resolvePenaltySchema = z.object({
  penaltyId: z.coerce.number().int().positive(),
  loanId: z.coerce.number().int().positive(),
});

export const guarantorSchema = z.object({
  loanId: z.coerce.number().int().positive(),
  fullName: z.string().min(2, "Enter the guarantor's full name"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  address: z.string().optional(),
  relationshipToBorrower: z.string().optional(),
});

export const collateralSchema = z.object({
  loanId: z.coerce.number().int().positive(),
  description: z.string().min(3, "Describe the collateral"),
  estimatedValue: z.coerce.number().int().positive().optional(),
});

export const cancelLoanCoolingOffSchema = z.object({
  loanId: z.coerce.number().int().positive(),
  reason: z.string().min(3, "Add a short reason for the file"),
});

export const complaintSchema = z.object({
  category: z.string().min(1, "Choose a category"),
  description: z.string().min(10, "Tell us a bit more about what happened"),
  loanId: z.coerce.number().int().positive().optional(),
  applicationId: z.coerce.number().int().positive().optional(),
});

export const updateComplaintStatusSchema = z.object({
  complaintId: z.coerce.number().int().positive(),
  status: z.enum(["open", "investigating", "resolved", "rejected"], {
    message: "Choose a status",
  }),
  resolutionNotes: z.string().optional(),
});

// Careers/hiring schemas.

export const jobPostingSchema = z.object({
  title: z.string().min(2, "Enter a job title"),
  department: z.string().optional(),
  location: z.string().min(2, "Enter a location"),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"], {
    message: "Choose an employment type",
  }),
  summary: z.string().min(10, "Add a one- or two-line summary").max(500),
  description: z.string().min(20, "Describe the role"),
  requirements: z.string().min(10, "List the requirements"),
});

export const jobApplicationSchema = z.object({
  jobPostingId: z.coerce.number().int().positive(),
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .min(10, "Please enter a valid phone number")
    .regex(/^[0-9+\s-]+$/, "Phone can only contain numbers"),
  coverLetter: z.string().max(3000).optional(),
});

export const checkApplicationStatusSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const jobAlertSignupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const updateApplicantStatusSchema = z.object({
  applicantId: z.coerce.number().int().positive(),
  status: z.enum(["new", "screening", "interview", "offer", "hired", "rejected"], {
    message: "Choose a status",
  }),
  notes: z.string().optional(),
});

export const setApplicantRatingSchema = z.object({
  applicantId: z.coerce.number().int().positive(),
  rating: z.enum(["unrated", "strong", "maybe", "not_fit"], {
    message: "Choose a rating",
  }),
});

export const bulkUpdateApplicantStatusSchema = z.object({
  applicantIds: z.array(z.coerce.number().int().positive()).min(1, "Select at least one applicant"),
  status: z.enum(["new", "screening", "interview", "offer", "hired", "rejected"], {
    message: "Choose a status",
  }),
});
