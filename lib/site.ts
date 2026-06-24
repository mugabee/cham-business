// Central place for content reused across pages.
// Edit loan products, contact details, and company info here once.

export const company = {
  name: "Cham Business Ltd",
  tagline: "Friendly loans for everyday life",
  address: "Kicukiro Modern Market, Kigali, Rwanda",
  phone: "+250 780 123 779",
  whatsapp: "+250780123779",
  email: "chambusinessltd@gmail.com",
  tiktok: "chambusinessltd",
  instagram: "cham_business_ltd",
  // Replace with real registration details once confirmed
  registrationNote:
    "Cham Business Ltd is a non-deposit lending institution. We do not accept deposits from the public. Company registration no. [TIN/RDB number].",
};

export type LoanProduct = {
  slug: string;
  name: string;
  blurb: string;
  range: string;
  term: string;
  rate: string;
  goodFor: string[];
};

export const loanProducts: LoanProduct[] = [
  {
    slug: "salary-advance",
    name: "Salary Advance",
    blurb:
      "A short-term advance against your monthly salary, to bridge the gap before payday.",
    range: "RWF 50,000 – 1,000,000",
    term: "1 – 3 months",
    rate: "From 3% / month",
    goodFor: ["Unexpected bills", "Rent before payday", "Quick cash needs"],
  },
  {
    slug: "personal-loan",
    name: "Personal Loan",
    blurb:
      "Flexible funds for school fees, medical costs, or family needs, repaid in steady instalments.",
    range: "RWF 200,000 – 5,000,000",
    term: "3 – 24 months",
    rate: "From 2.5% / month",
    goodFor: ["School fees", "Medical costs", "Home improvements"],
  },
  {
    slug: "business-boost",
    name: "Business Boost",
    blurb:
      "Working capital for individual traders and small businesses ready to grow stock or operations.",
    range: "RWF 500,000 – 10,000,000",
    term: "6 – 36 months",
    rate: "From 2% / month",
    goodFor: ["Buying stock", "Equipment", "Growing a small business"],
  },
];

export const faqs = [
  {
    q: "Who can apply for a loan?",
    a: "Any individual resident in Rwanda who is 18 or older, has a verifiable source of income, and can show ability to repay. You'll need a valid national ID.",
  },
  {
    q: "How long does approval take?",
    a: "Most applications receive a decision within 24 hours. Once approved, funds are usually disbursed the same day to your mobile money or bank account.",
  },
  {
    q: "What do I need to apply?",
    a: "A valid national ID, proof of income (such as a payslip or business records), and your mobile money or bank details for disbursement.",
  },
  {
    q: "Are there hidden fees?",
    a: "No. We show you the full cost of your loan — interest and any fees — before you accept. What you agree to is what you pay.",
  },
  {
    q: "Is Cham Business a bank?",
    a: "No. We are a non-deposit lending institution. We do not take deposits or savings from the public — we only provide loans to individuals.",
  },
  {
    q: "What happens if I repay late?",
    a: "Contact us as early as possible if you expect difficulty. We'd rather work out a plan with you than see you fall behind. Late repayment may incur additional charges as set out in your loan agreement.",
  },
];