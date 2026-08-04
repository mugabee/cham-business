# Security Policy

This system handles real borrower financial data for a licensed lender. Security reports are
taken seriously and triaged quickly.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, email **chambusinessltd@gmail.com** with:

- A description of the vulnerability and its potential impact.
- Steps to reproduce (a proof of concept, if you have one).
- Any suggested remediation, if you have one.

You'll get an acknowledgement within a few business days. If the report is confirmed, we'll work
on a fix and let you know once it's deployed. We ask that you give us a reasonable window to
remediate before any public disclosure.

## Scope

In scope: the application code in this repository, its authentication flows (staff and borrower),
data handling, and the deployment configuration described in the README.

Out of scope: social engineering against staff or customers, physical security of the hosting
provider, and denial-of-service testing against the production environment (this runs on
resource-constrained shared hosting -- a load test *is* an outage).

## What's already in place

See the [Security section of the README](README.md#security) for the current baseline: encrypted
national ID storage, hashed credentials, parameterized queries, an audit log on every mutating
staff action, and documents served only through authenticated routes.
