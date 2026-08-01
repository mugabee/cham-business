import { monthlyPayment } from "@/lib/loan-math";

// BNR Regulation 55/2022, Articles 95-96: a financial service provider must
// not grant an amount whose periodic repayment exceeds a set percentage of
// the consumer's periodic income. 40% is a common, conservative
// debt-to-income ceiling for unsecured consumer lending -- staff can still
// override it (with a reason, logged), this is a warning gate, not a hard
// block, since some applicants have valid reasons (co-signed household
// income, seasonal business income) that a single "monthly income" field
// can't capture.
export const DTI_WARNING_THRESHOLD = 0.4;

export function estimateMonthlyInstallment(
  principal: number,
  termMonths: number,
  monthlyRate = 0.05
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  return monthlyPayment(principal, termMonths, monthlyRate);
}

/** Installment / monthly income. Returns Infinity if income is 0 (can't assess). */
export function computeDebtToIncomeRatio(monthlyInstallment: number, monthlyIncome: number): number {
  if (!monthlyIncome || monthlyIncome <= 0) return Infinity;
  return monthlyInstallment / monthlyIncome;
}

export function exceedsDtiThreshold(
  principal: number,
  termMonths: number,
  monthlyIncome: number,
  monthlyRate = 0.05
): boolean {
  const installment = estimateMonthlyInstallment(principal, termMonths, monthlyRate);
  return computeDebtToIncomeRatio(installment, monthlyIncome) > DTI_WARNING_THRESHOLD;
}
