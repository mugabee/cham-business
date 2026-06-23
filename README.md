# Cham Business Ltd — Website

A Next.js website for Cham Business Ltd, a non-deposit lender in Rwanda.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What's built (Phase 1)

Public pages, all responsive and accessible:
- Home
- Loans (/loans)
- How it works (/how-it-works)
- About (/about)
- FAQ (/faq)
- Apply (/apply) — application form with validation

### Where to edit content
- Loan products, contact details, FAQ: `lib/site.ts`
- Theme colors: `app/globals.css` (the `@theme` block)

## Application form
Submissions POST to `/api/apply`, which validates the data on the server.
Right now it accepts the application but does NOT yet store or email it —
that comes in Phase 2 when the database is connected.

## Still to do (Phase 2 & 3)
- Database + staff login (Supabase)
- Admin dashboard: applications, borrowers, loans, repayments
- Accounting & analytics
- Connect /api/apply to the database + email notifications

## Important before going live with real data
- Confirm company registration / licensing details (placeholders in lib/site.ts and footer)
- Comply with Rwanda's data protection law (Law N° 058/2021); register as a data controller
- Add a privacy policy
- Get local legal advice on holding borrower data
