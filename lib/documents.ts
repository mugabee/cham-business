// Shared between the public apply form and the admin application view --
// single source of truth for which documents exist, when they're shown,
// and the application-fee formula.

export type DocumentKey =
  | "id_copy"
  | "spouse_id_copy"
  | "marital_certificate"
  | "bank_statement"
  | "momo_statement"
  | "collateral_appraisal"
  | "rra_clearance"
  | "rent_agreement"
  | "sponsor_letter_1"
  | "sponsor_letter_2"
  | "itemized_list";

export type DocumentTypeDef = {
  key: DocumentKey;
  label: string;
  required: boolean;
  businessOnly?: boolean;
  showIf?: "married" | "not_single";
};

export const DOCUMENT_TYPES: DocumentTypeDef[] = [
  { key: "id_copy", label: "ID copy", required: true },
  { key: "spouse_id_copy", label: "Spouse's ID copy", required: false, showIf: "married" },
  {
    key: "marital_certificate",
    label: "Marital status certificate (marriage or divorce certificate)",
    required: true,
    showIf: "not_single",
  },
  { key: "bank_statement", label: "Bank statement", required: true },
  { key: "momo_statement", label: "Mobile money (MoMo) statement history", required: true },
  {
    key: "collateral_appraisal",
    label: "Collateral valuation / expert appraisal (optional)",
    required: false,
  },
  {
    key: "rra_clearance",
    label: "Rwanda Revenue Authority (RRA) clearance certificate",
    required: true,
    businessOnly: true,
  },
  {
    key: "rent_agreement",
    label: "6-month rent agreement for the business location",
    required: true,
    businessOnly: true,
  },
  {
    key: "sponsor_letter_1",
    label: "Sponsor letter 1 (from a neighboring business owner confirming they know you)",
    required: true,
    businessOnly: true,
  },
  {
    key: "sponsor_letter_2",
    label: "Sponsor letter 2 (from a neighboring business owner confirming they know you)",
    required: true,
    businessOnly: true,
  },
  {
    key: "itemized_list",
    label: "Itemized list of items and costs the loan will fund",
    required: true,
    businessOnly: true,
  },
];

export function visibleDocumentTypes(
  loanType: string,
  maritalStatus?: string
): DocumentTypeDef[] {
  return DOCUMENT_TYPES.filter((doc) => {
    if (doc.businessOnly && loanType !== "Business Loan") return false;
    if (doc.showIf === "married" && maritalStatus !== "married") return false;
    if (doc.showIf === "not_single" && (!maritalStatus || maritalStatus === "single")) return false;
    return true;
  });
}

export const PURPOSE_CATEGORIES = [
  "School fees / tuition",
  "Medical expenses",
  "Home improvement or renovation",
  "Business stock / inventory",
  "Debt consolidation",
  "Emergency / unexpected expense",
  "Other",
] as const;

/** 1% of the requested amount + 18% VAT on that fee, floored at RWF 30,000. */
export function calculateApplicationFee(loanAmount: number): number {
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return 30000;
  const raw = loanAmount * 0.01 * 1.18;
  return Math.max(30000, Math.round(raw));
}
