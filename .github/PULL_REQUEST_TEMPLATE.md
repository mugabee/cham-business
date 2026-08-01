## What changed and why

## How it was verified

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] Checked in a live browser (not just read from the diff), if this touches UI
- [ ] Added/updated a `db/migration-*.sql` file and mirrored the change in `db/schema.sql`, if this touches the schema
- [ ] Mutating actions write an `audit_log` row, if this adds a new staff-facing mutation

## Screenshots (if UI changed)
