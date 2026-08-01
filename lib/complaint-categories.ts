// Shared between the client-side complaint form and the server-side
// lib/complaints.ts -- kept in its own file (no "server-only") so client
// components can import it directly.
export const COMPLAINT_CATEGORIES = [
  "Fees or charges",
  "Loan decision or terms",
  "Payment not reflected",
  "Staff conduct",
  "Debt collection practices",
  "Other",
] as const;
