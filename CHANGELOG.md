# Changelog

This project deploys continuously to production rather than cutting semantic-version releases, so
this changelog is organized by milestone rather than version number. Entries are curated from the
real commit history, condensed for readability and not fabricated.

## 2026-08-01: Consumer protection compliance

- Mapped BNR Regulation N° 55/2022 (financial service consumer protection) against the codebase
  and closed the gaps: an in-duplum penalty cap, a debt-to-income warning at underwriting, a
  30-day cooling-off cancellation window, guarantor and collateral tracking with statutory
  notifications, a formal complaints channel (staff + borrower portal), and published
  contract-template / service-charter / key-facts-statement pages.
- Enforced HTTPS site-wide at the application layer and fixed a reverse-proxy host-header bug that
  had been redirecting visitors to the internal backend address instead of the public domain.

## 2026-07-30 to 2026-07-31: Borrower self-service portal

- Added a passwordless, OTP-based borrower portal, fully separate from staff auth: borrowers can
  complete their own KYC details and documents, track their loan and repayment schedule, and
  submit payment proof for staff review.
- Let staff complete applicant details/documents on a borrower's behalf, for customers less
  comfortable doing it online themselves.
- Redesigned both the admin panel and borrower portal for mobile responsiveness and a unified
  brand.

## 2026-07-28 to 2026-07-29: Full back-office + data-protection safeguards

- Built the complete staff back-office: applications, borrowers, loans, payments, accounting,
  analytics, and an audit log covering every mutating staff action.
- Added two-tier archive/permanent-delete across applications, borrowers, loans, and payments,
  with entity-specific safety rules (e.g. a loan can only be hard-deleted once written off).
- Added loan restructuring, a write-off action, edit flows for borrowers/applications/payments,
  and automated overdue-repayment email reminders.
- Expanded the public application form to collect a full applicant profile with document uploads
  and an auto-calculated origination fee.

## 2026-07-16 to 2026-07-25: Production deployment on shared hosting

- Migrated staff authentication from Supabase to a self-hosted MySQL + bcrypt + session-cookie
  implementation, moving the whole stack onto self-managed cPanel hosting.
- Diagnosed and fixed a string of shared-hosting-specific production issues: a CPU/process-count
  limit crashing builds (fixed via a custom `server.js` entrypoint and capped build concurrency),
  and environment variables not reaching Next.js's request-handling worker processes (fixed by
  loading `.env.local` at the point of use in every module that needs it, not just at boot).

## 2026-06-23 to 2026-06-25: Public site + foundations

- Launched the public marketing site: home, loan products, how-it-works, about, FAQ, and an apply
  form with client + server-side validation.
- Added the reducing-balance amortization engine and its schedule generator.
- Added the initial protected `/admin` shell and password-reset flow.
