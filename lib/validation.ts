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
