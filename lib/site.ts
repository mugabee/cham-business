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
  registrationNote:
    "Cham Business Ltd is a non-deposit lending institution. We do not accept deposits from the public.",
  equalOpportunityStatement:
    "Cham Business Ltd is an equal-opportunity employer. We consider every application on its merits, regardless of gender, ethnicity, religion, disability, or any other characteristic unrelated to the role.",
};

// Every job applicant answers these on video and sends the clip to our
// WhatsApp number -- see components/JobApplicationForm.tsx.
export const videoInterviewQuestions = [
  "Tell us about yourself and your background.",
  "Why do you want to work at Cham Business Ltd?",
  "Describe a challenge you've faced and how you handled it.",
  "Why should we choose you for this role?",
];

export type LoanProduct = {
  slug: string;
  name: string;
  blurb: string;
  description: string;
  goodFor: string[];
};

// All loan types share the same quick-fact terms
export const loanTerms = {
  range: "RWF 300,000 – 20,000,000",
  rate: "5% / month (reducing balance)",
  term: "Agreed with you",
};

export const loanProducts: LoanProduct[] = [
  {
    slug: "plots-house",
    name: "Plots & House Loan",
    blurb: "Finance land or property purchases with a loan sized to match the opportunity.",
    description:
      "Whether you are buying a plot to build on or securing a house for your family, our Plots & House Loan gives you the capital to act quickly. We work with you to agree a repayment schedule that fits your income — weekly, fortnightly, or monthly — so ownership feels manageable from day one. Loans start at RWF 300,000 and go up to RWF 20,000,000 depending on your affordability assessment.",
    goodFor: ["Buying land", "Purchasing a home", "Property investment"],
  },
  {
    slug: "emergency",
    name: "Emergency Loan",
    blurb: "Fast funds when something urgent can't wait — medical bills, repairs, or family crises.",
    description:
      "Life doesn't give advance notice. Our Emergency Loan is designed to get money into your hands as quickly as possible — often the same day you apply — so you can deal with the situation without the extra stress of a slow process. We keep the paperwork minimal and the decision fast. Tell us what you need and we will find a repayment rhythm that works for you.",
    goodFor: ["Medical emergencies", "Urgent repairs", "Unexpected family expenses"],
  },
  {
    slug: "business",
    name: "Business Loan",
    blurb: "Working capital to buy stock, grow operations, or bridge a gap in your business cash flow.",
    description:
      "From market traders needing to restock before a busy season to small shop owners expanding their range, our Business Loan supports individual entrepreneurs across Rwanda. Borrow from RWF 300,000 up to RWF 20,000,000. We assess your business records openly and agree a repayment plan around your trading cycle — so repayments go out when money is coming in.",
    goodFor: ["Buying stock", "Equipment & tools", "Expanding your business"],
  },
  {
    slug: "personal",
    name: "Personal Loan",
    blurb: "Flexible funding for school fees, home improvements, or any personal need.",
    description:
      "Whatever life brings — school fees, a ceremony, home renovations, or simply a gap you need to bridge — our Personal Loan puts the money in your account with clear, agreed terms. There are no hidden charges. Interest is charged at 5% per month on the reducing balance, and we agree the repayment period together before you sign anything.",
    goodFor: ["School & tuition fees", "Home improvements", "Family events"],
  },
  {
    slug: "salary",
    name: "Salary Loan",
    blurb: "An advance against your salary to cover costs before payday arrives.",
    description:
      "If you are employed and need funds before your next pay cheque, our Salary Loan is the quickest route. We verify your income, agree an amount, and disburse — often the same day. Repayments are structured to align with your salary dates so you are never caught short. Suitable for civil servants, private-sector employees, and anyone with a regular, verifiable income.",
    goodFor: ["Bridging to payday", "Rent & utilities", "Quick personal needs"],
  },
  {
    slug: "car",
    name: "Car Loan",
    blurb: "Buy the vehicle you need — for work, family transport, or business — with straightforward terms.",
    description:
      "Whether you need a car for daily commuting, running a delivery business, or family transport, our Car Loan helps you get on the road without draining your savings. Borrow up to RWF 20,000,000. We agree the repayment schedule around your income so monthly instalments are predictable. The flat 5% monthly interest means you always know exactly what you owe.",
    goodFor: ["Personal vehicle", "Work & delivery transport", "Business use"],
  },
];

export const loanDetails = {
  "plots-house":
    "Whether you are buying a plot to build on or securing a house for your family, our Plots & House Loan gives you the capital to act quickly. We work with you to agree a repayment schedule that fits your income — weekly, fortnightly, or monthly — so ownership feels manageable from day one. Loans start at RWF 300,000 and go up to RWF 20,000,000 depending on your affordability assessment.",
  emergency:
    "Life doesn't give advance notice. Our Emergency Loan is designed to get money into your hands as quickly as possible — often the same day you apply — so you can deal with the situation without the extra stress of a slow process. We keep the paperwork minimal and the decision fast. Tell us what you need and we will find a repayment rhythm that works for you.",
  business:
    "From market traders needing to restock before a busy season to small shop owners expanding their range, our Business Loan supports individual entrepreneurs across Rwanda. Borrow from RWF 300,000 up to RWF 20,000,000. We assess your business records openly and agree a repayment plan around your trading cycle — so repayments go out when money is coming in.",
  personal:
    "Whatever life brings — school fees, a ceremony, home renovations, or simply a gap you need to bridge — our Personal Loan puts the money in your account with clear, agreed terms. There are no hidden charges. Interest is charged at 5% per month on the reducing balance, and we agree the repayment period together before you sign anything.",
  salary:
    "If you are employed and need funds before your next pay cheque, our Salary Loan is the quickest route. We verify your income, agree an amount, and disburse — often the same day. Repayments are structured to align with your salary dates so you are never caught short. Suitable for civil servants, private-sector employees, and anyone with a regular, verifiable income.",
  car: "Whether you need a car for daily commuting, running a delivery business, or family transport, our Car Loan helps you get on the road without draining your savings. Borrow up to RWF 20,000,000. We agree the repayment schedule around your income so monthly instalments are predictable. Interest is charged at 5% per month on the reducing balance, so as you repay, the interest portion shrinks.",
};

export const interestExplainer = {
  headline: "How our interest works",
  summary:
    "We charge 5% per month on the remaining balance — not the original amount. As you repay, the interest portion of each payment shrinks and more goes toward the principal. Every payment is equal, and you see the full schedule before you sign anything.",
  example: {
    principal: "RWF 1,000,000",
    months: "4 months",
    monthlyPayment: "≈ RWF 282,012",
    totalInterest: "≈ RWF 128,047",
    totalRepayment: "≈ RWF 1,128,047",
    breakdown:
      "Because interest is charged on the reducing balance, the interest portion of each payment shrinks as you repay — but your payment stays the same every month.",
    disclaimer:
      "This is an illustration. Your exact payment and schedule depend on the amount and period you agree with us, and the full schedule is shown before you sign.",
  },
};

export const applyRequirements = [
  { label: "National ID", detail: "A valid Rwandan national identity card." },
  {
    label: "Proof of income",
    detail:
      "A recent payslip, bank statement, or business records showing your regular income.",
  },
  {
    label: "Account details",
    detail:
      "Your mobile money number (MTN or Airtel) or bank account for disbursement.",
  },
  {
    label: "Loan purpose",
    detail:
      "A brief explanation of what the funds are for — this helps us find the right product and amount for you.",
  },
];

export const repaymentExplainer =
  "We don't force you into a one-size-fits-all schedule. Repayments can be made daily, weekly, or monthly — whichever matches your income pattern. We agree the schedule with you before the loan is disbursed, and it is written into your agreement so there is no ambiguity. If your circumstances change, contact us early and we will work with you.";

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
