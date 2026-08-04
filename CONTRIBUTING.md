# Contributing

Honest heads-up: this is closed-source, proprietary software for a live lending business (see
[LICENSE](LICENSE)), and it isn't set up to accept outside pull requests. This document exists to
be transparent about how the project is actually built and maintained, not to invite contributions.

## How this project is built

- **Solo-maintained.** One engineer owns product, backend, frontend, database design, and
  deployment.
- **Feature-branch-free, incremental commits to `main`.** Each commit is a working, verified
  increment -- the codebase stays deployable at every commit, not just at release points.
- **Verify before commit.** `npx tsc --noEmit` and `npm run build` are run locally before every
  commit that touches application code; UI changes are checked in a live browser, not just
  assumed correct from reading the diff.
- **Migrations are additive and tracked.** Schema changes ship as a new `db/migration-*.sql` file
  (never an edit to an already-applied migration) plus a matching update to `db/schema.sql` so a
  fresh install and the live database never drift apart.
- **Every mutating action is audited.** New staff-facing mutations are expected to write an
  `audit_log` row; this isn't optional per-feature, it's a project-wide invariant.

## Reporting a bug or vulnerability

- **Security issues:** see [SECURITY.md](SECURITY.md) -- please don't file these as public issues.
- **Everything else:** open an issue with steps to reproduce. Since this isn't accepting external
  code contributions, issues are for visibility rather than a promise of a fix timeline.

## Commit message style

Imperative mood, present tense, explaining *why* over *what* where it isn't obvious from the diff
itself (`git log` is the record of what changed; the message earns its place by adding context a
diff can't):

```
Add cooling-off cancellation window for loans

BNR Reg 55/2022 Art 54 requires a penalty-free withdrawal window before
disbursement; this system disburses at loan creation, so the closest
faithful equivalent is: no payments yet + within 30 days of creation.
```
