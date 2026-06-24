# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # serve production build
```

No test runner is configured yet.

## Architecture

This is a Next.js 16 App Router project (React 19, TypeScript, Tailwind CSS v4).

**Routing** — all pages live under `app/` using the App Router file convention. The shared shell (`Navbar` + `Footer`) is applied in `app/layout.tsx`.

**Content layer** — `lib/site.ts` is the single source of truth for all business content: loan products, company details, and FAQs. Edit it once; all pages consume it.

**Validation** — `lib/validation.ts` exports a Zod schema (`applicationSchema`) used by both the client-side form and the server-side API route to validate loan applications.

**Form** — `components/ApplyForm.tsx` uses `react-hook-form` + `@hookform/resolvers/zod`. On submit it POSTs to `/api/apply`.

**API route** — `app/api/apply/route.ts` re-validates the payload server-side and returns `{ ok: true }`. Phase 2 will persist to a database.

## Phase 2 (planned — not yet built)

`PHASE-2-PLAN.md` contains the full spec for an admin back-office system. Planned additions:

- **Supabase** — Postgres, staff auth, file storage
- **Prisma** — type-safe DB access with migrations
- **`app/admin/`** — protected admin shell (login redirect if unauthenticated)
- **`app/login/`** — staff login page
- **`lib/supabase.ts`** and **`lib/prisma.ts`** — client setup

Key business rule: loans use **reducing-balance** amortization. See `PHASE-2-PLAN.md` for the formula and database schema.

All secrets go in `.env.local` (never committed). Every admin route must redirect unauthenticated users to `/login`. An audit log must record all staff writes to financial records.
