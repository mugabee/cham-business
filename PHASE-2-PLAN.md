# Phase 2 Build Plan -- Cham Business Ltd Admin System

This document is the brief for building the admin/back-office system on top of the
existing public site. Build incrementally, verify each part works before moving on,
and commit to Git after each working piece.

## Business rules (decided)

- **Interest method:** Reducing balance. Interest is charged on the outstanding
  principal, so it decreases as the borrower repays. Each loan has an amortization
  schedule of equal periodic instalments, each split into a principal portion and
  an interest portion.
- **Repayment methods:** Mobile money (MTN / Airtel) and bank transfer. Each
  payment records its method and an optional external reference (e.g. transaction ID).
- **Staff access:** A small number of staff, all sharing the same "staff" role for
  now. Design auth so additional roles (accountant, loan officer) can be added later
  without rework.

## Tech stack

- Next.js (existing project, App Router)
- Supabase -- Postgres database, staff authentication, secure file storage
- Prisma -- type-safe database access
- Recharts -- analytics charts
- Deployed on Vercel (existing setup)

## Security requirements (non-negotiable)

- All secrets in environment variables (`.env.local`), never committed to Git.
- Passwords handled by Supabase Auth (hashed; never store plain passwords).
- Every admin route protected -- redirect to login if not authenticated.
- An **audit log**: record who created/edited/deleted financial records, and when.
- Store the **minimum** sensitive data needed. Record national ID *number*
  (encrypted at rest if possible); avoid storing ID photos unless truly required.
- HTTPS only (Vercel provides this).

## Database schema

Build these tables (via Prisma migrations against Supabase Postgres):

### staff
- id, email, full_name, role (default "staff"), created_at
- (auth handled by Supabase Auth; this table holds profile + role)

### borrowers
- id, full_name, phone, email (nullable), national_id (encrypted),
  monthly_income, address, created_at, created_by (staff id)

### applications
- id, borrower_id (nullable until linked), full_name, phone, email,
  loan_type, amount_requested, purpose, monthly_income,
  status (enum: new / reviewing / approved / rejected),
  submitted_at, reviewed_by, reviewed_at, notes
- The public Apply form (`/api/apply`) writes here.

### loans
- id, borrower_id, principal, interest_rate_monthly, term_months,
  method (reducing_balance), status (active / paid_off / overdue / written_off),
  disbursed_at, disbursed_by, created_at
- On creation, generate the repayment schedule (below).

### repayment_schedule
- id, loan_id, instalment_number, due_date,
  principal_due, interest_due, total_due,
  status (pending / paid / partial / overdue)

### payments
- id, loan_id, amount, method (mtn / airtel / bank),
  reference (nullable), paid_at, recorded_by, notes
- Applying a payment updates the relevant schedule rows and loan balance.

### audit_log
- id, staff_id, action, entity, entity_id, detail (json), created_at

## Amortization (reducing balance)

For a loan of principal P, monthly rate r, term n months, the equal instalment is:

    A = P * r / (1 - (1 + r)^-n)

For each instalment: interest_due = current_balance * r;
principal_due = A - interest_due; new_balance = current_balance - principal_due.
Generate all n schedule rows at disbursement. Round to whole RWF; adjust the final
instalment so the loan closes exactly at zero.

## Admin features (build in this order)

1. **Auth + admin shell** -- staff login (Supabase), protected `/admin` layout with
   sidebar nav, logout. Nothing else accessible without login.
2. **Applications** -- list incoming applications from the public form; view detail;
   approve/reject; on approve, create a borrower + loan.
3. **Borrowers** -- list, search, view a borrower and their loans.
4. **Loans** -- list active loans; loan detail showing the schedule and balance;
   create a loan (generates schedule).
5. **Payments** -- record a payment against a loan; auto-update schedule + status;
   flag overdue instalments.
6. **Accounting** -- totals: disbursed, collected, outstanding principal, interest
   earned, overdue amount. Exportable (CSV) for the accountant.
7. **Analytics** -- charts: new loans over time, portfolio value, collection rate,
   overdue trend.
8. **Audit log view** -- read-only list of staff actions.

## Connect the public form

Update `/api/apply` to insert into the `applications` table (status = "new")
and optionally email the team on new submissions.

## Suggested folder additions

```
app/
  admin/
    layout.tsx           # protected shell + sidebar
    page.tsx             # dashboard
    applications/
    borrowers/
    loans/
    payments/
    accounting/
    analytics/
  login/page.tsx
lib/
  supabase.ts            # client setup
  prisma.ts              # prisma client
prisma/
  schema.prisma
```

## Compliance reminders (handle outside code)

- Confirm Cham Business Ltd's lending registration/licensing.
- Comply with Rwanda's data protection law (Law N° 058/2021); register as a data
  controller with the NCSA if required.
- Publish a privacy policy; collect only data you have a lawful basis to hold.
- Get local legal advice before going live with real borrower data.

## Working method

- Build one numbered feature at a time; confirm it runs before the next.
- Never commit `.env.local` or secrets.
- Commit to Git after each working feature so there's always a safe restore point.
