# ACME Salary Management

A web app for ACME's HR manager to manage salary data for 10,000 employees across 8 countries and answer "how do we pay people?" without spreadsheets.

- **Live app:** <!-- LIVE_URL -->
- **Demo video:** <!-- DEMO_VIDEO -->

## Features
- **Employees:** server-side paginated directory (25/page) with search (name, email, code), filters (country, department, job title, type) and sort (name, salary, hire date). Create, edit and delete with validation and a delete confirmation.
- **Insights:** org headcount, payroll, mean and median (USD); per-country min/avg/median/max in local currency and USD; per-job-title stats within a selected country; per-department summary; salary distribution chart.
- **Seed:** exactly 10,000 deterministic employees (seeded PRNG, per-country names, per-country job-title pay bands, local currencies, static FX table).

## Stack
Next.js (App Router) + TypeScript (strict) + Mantine + better-sqlite3 + zod + Vitest. Backend logic is plain TypeScript in `src/server/**` (no Next imports).

## Run locally
Requires Node 20+ (developed on Node 24).
```bash
npm install
npm run seed      # creates data/acme.db with 10,000 employees
npm run dev       # http://localhost:3000
```
Production build: `npm run build` (seeds the DB, then `next build`) and `npm start`.

## Test
```bash
npm test                 # fast, deterministic unit tests (in-memory SQLite)
npm run test:coverage    # coverage for src/server/** (threshold: 85% lines)
npm run typecheck
npm run lint
```

## API
`GET/POST /api/employees`, `GET/PUT/DELETE /api/employees/:id`, `GET /api/meta`,
`GET /api/insights/{summary,by-country,by-job-title?country=,by-department,distribution}`.
Errors always look like `{ "error": { "code", "message", "details?" } }` with 400 (validation), 404 (missing) and 409 (duplicate email).

## Deployment notes
Vercel: `npm run build` seeds `data/acme.db`, and `next.config.ts` bundles it with the serverless functions. At runtime on Vercel the file is copied to `/tmp/acme.db` (writable). Writes are per-instance and reset on cold start; production would use Postgres or Turso. See `docs/decisions.md`.

## Project structure
```
src/server/domain       schemas (zod), FX/USD normalisation, stats, employee codes
src/server/repository   SQL (better-sqlite3)
src/server/services     employee + insights use cases
src/server/api          framework-free request handlers and error mapping
src/server/seed         deterministic data generation
src/app                 pages and thin route handlers
src/components, src/lib UI and client helpers
scripts/seed.ts         seed CLI
tests/                  Vitest suites
docs/                   requirements, architecture, decisions, AI log
```

## Docs
- [Assessment](docs/assessment.md) · [Requirements](docs/requirements.md) · [Architecture](docs/architecture.md) · [Decisions and trade-offs](docs/decisions.md)
- [AI build brief](docs/ai/00-build-brief.md) · [AI log](docs/ai/ai-log.md)
