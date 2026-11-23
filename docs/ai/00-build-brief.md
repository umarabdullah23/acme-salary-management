# Build brief given to the AI coding agent (Claude Sonnet)

This is the exact instruction set the implementation agent worked from. The assessment text is in `docs/assessment.md`.

## Goal
ACME's HR manager manages salaries for 10,000 employees across several countries in spreadsheets. Build a web app where the HR manager can manage salary data and answer "how does the org pay people?" questions.

## Stack (decided up front, see `docs/decisions.md` for why)
- TypeScript end to end, strict mode.
- Next.js (App Router) for UI + backend (route handlers). Backend code lives in `src/server/**` as plain TypeScript modules (domain, repository, service) with no Next.js imports, so it is unit-testable and portable to Express/Nest later.
- SQLite via `better-sqlite3` (synchronous, fast, zero-ops). Schema created by SQL migration file; no ORM.
- UI: Mantine (component library) + server-side pagination/filtering.
- Validation: zod, shared between API and forms.
- Tests: Vitest. Repository/service tests run against an in-memory SQLite DB (`:memory:`), deterministic seed (seeded PRNG).
- Deploy target: Vercel. SQLite file is seeded at build time; at runtime it is copied to `/tmp` (writable) on cold start. Trade-off documented: writes are per-instance and reset on cold start; production would use Postgres/Turso.

## Working rules
1. Write `docs/requirements.md` (one page) FIRST and commit it before any code.
2. Then `docs/architecture.md` (layers, data model, API, a mermaid diagram) and `docs/decisions.md` (trade-offs, performance notes).
3. Build in small vertical slices with TDD where practical. Commit after every meaningful step (aim for 15-25 commits) with clear messages. Never one giant commit.
4. Keep functions small, names explicit, no dead code, no `any`.
5. Every commit must pass `npm run typecheck && npm test`.
6. Log notable prompts / AI decisions / corrections you made in `docs/ai/ai-log.md` as you go (short bullets: what you asked the AI, what you accepted, what you changed and why).

## Data model
- `employees`: id, employee_code (unique, e.g. ACME-000123), full_name, email (unique), job_title, department, country (ISO-2), currency (ISO-4217), salary (integer, minor units? no: whole local currency units per year), employment_type (full_time | part_time | contractor), hire_date (ISO date), created_at, updated_at.
- `fx_rates`: currency -> rate_to_usd (static reference table seeded once, dated). All org-wide comparisons are normalised to USD; per-country views show local currency.
- Indexes for the filter/sort columns (country, department, job_title, salary_usd or computed column).

## Features (in scope)
1. Employee directory: server-side paginated table (25/page), search by name/email/code, filter by country, department, job title, employment type; sort by name, salary, hire date.
2. Create / edit / delete an employee (form with validation; delete with confirmation).
3. Insights dashboard:
   - Org totals: headcount, annual payroll in USD, median and mean salary (USD).
   - By country: headcount, min / max / avg / median salary (local currency and USD).
   - By job title within a country: min / max / avg salary (the core HR question: "what do we pay a Software Engineer in India?").
   - By department: headcount + avg salary USD.
   - Salary distribution histogram (USD bands).
4. Seed script: `npm run seed` creates exactly 10,000 realistic employees deterministically (seeded PRNG; first names/last names lists per country; job title salary bands per country so numbers make sense). Must run in a few seconds (single transaction, prepared statement).

## Out of scope (state these in requirements.md with reasons)
Auth/roles, salary history & raises workflow, payroll processing/tax, CSV import (mention as next step), live FX rates, audit log, multi-tenant.

## API (route handlers, JSON)
- `GET /api/employees?q=&country=&department=&jobTitle=&type=&sort=&order=&page=&pageSize=`
- `POST /api/employees`, `GET/PUT/DELETE /api/employees/:id`
- `GET /api/insights/summary`, `/api/insights/by-country`, `/api/insights/by-job-title?country=`, `/api/insights/by-department`, `/api/insights/distribution`
- `GET /api/meta` (distinct countries, departments, job titles for filters)
Consistent error shape `{ error: { code, message, details? } }`, 400 on validation, 404 on missing, 409 on duplicate email/code.

## Tests (meaningful, fast)
- Domain: validation schema, salary normalisation to USD, median calculation, employee code generation.
- Repository: create/read/update/delete, filtering, pagination, sorting, unique constraint mapping to domain error.
- Insights service: aggregates against a small hand-made fixture with known answers (min/max/avg/median per country and per title).
- Seed: generates exactly N employees, deterministic for same seed, salaries inside the title band.
- API handlers: at least one happy path + validation error test per route group (call handler functions directly).
Target: core server code > 85% line coverage (`npm run test:coverage`).

## Scripts
`dev`, `build` (runs seed into `data/acme.db` then next build), `start`, `seed`, `test`, `test:coverage`, `typecheck`, `lint`.

## README
What it is, live URL placeholder `<!-- LIVE_URL -->`, demo video placeholder `<!-- DEMO_VIDEO -->`, how to run locally, how to test, project structure, links to docs. Short and scannable.
