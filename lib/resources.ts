// Metadata for the /resources articles -- used by the index page, the
// sitemap, and each article's own JSON-LD. Content itself lives in each
// article's page.tsx (no CMS; these are hand-written, reviewed pages).

export type ResourceArticle = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
};

export const resources: ResourceArticle[] = [
  {
    slug: "how-to-get-a-personal-loan-fast-in-rwanda",
    title: "How to Get a Personal Loan Fast in Rwanda",
    excerpt:
      "What actually makes a loan application fast or slow, and how to put yourself in the first group.",
    publishedAt: "2026-07-18",
    readingMinutes: 5,
  },
  {
    slug: "salary-loan-vs-emergency-loan",
    title: "Salary Loan vs. Emergency Loan: Which One Do You Need?",
    excerpt:
      "A salary loan bridges a predictable gap before payday. An emergency loan covers an unplanned expense right now.",
    publishedAt: "2026-07-22",
    readingMinutes: 4,
  },
  {
    slug: "documents-needed-to-apply-for-a-loan-in-rwanda",
    title: "Documents You Need to Apply for a Loan in Rwanda",
    excerpt:
      "The exact list, for personal and business loans, plus the one fee that's calculated upfront -- no surprises.",
    publishedAt: "2026-07-25",
    readingMinutes: 5,
  },
  {
    slug: "how-reducing-balance-interest-works",
    title: "How Reducing-Balance Interest Works (and Why It Saves You Money)",
    excerpt:
      "The same 5% rate can cost very different amounts depending on how it's calculated. Here's the difference.",
    publishedAt: "2026-07-29",
    readingMinutes: 6,
  },
  {
    slug: "5-signs-your-business-is-ready-for-a-loan",
    title: "5 Signs Your Business Is Ready for a Loan",
    excerpt:
      "Borrowing to grow a business works when the timing is right. Here's how to tell.",
    publishedAt: "2026-08-01",
    readingMinutes: 5,
  },
];

export function getResourceBySlug(slug: string): ResourceArticle | undefined {
  return resources.find((r) => r.slug === slug);
}
