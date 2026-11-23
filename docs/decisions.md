# Decisions and trade-offs

| # | Decision | Why | Trade-off |
|---|---|---|---|
| 1 | Next.js App Router for UI and API | One deployable, one language, required by the brief | Route handlers couple to Vercel-style hosting; mitigated by keeping all logic in `src/server` |
| 2 | `better-sqlite3`, no ORM | Synchronous, fastest embedded option, SQL is the clearest way to express the aggregates | Hand-written SQL; native module needs `serverExternalPackages` |
| 3 | Plain SQL migration file | Tiny schema, no tooling needed | No migration history; fine for a single-version demo |
| 4 | Store `salary_usd` at write time | Indexable, simple aggregates and sorting across currencies | Must be recomputed if FX rates change (a reseed or one UPDATE) |
| 5 | Whole currency units, integer salary | No float money bugs; salaries here are annual whole numbers | No cents; acceptable for annual salary |
| 6 | Static FX table | Deterministic numbers and tests | Not live; dated via `as_of` |
| 7 | Medians in TypeScript | SQLite has no `MEDIAN`; window-function SQL is harder to read and test | Reads one column per group; trivial at 10k rows, revisit at millions |
| 8 | zod schema shared by API and form | One source of truth for validation | Form shows server messages, not live per-keystroke checks |
| 9 | Server-side paging/filter/sort | Keeps payloads small and UI fast | More round trips than loading everything client-side |
| 10 | SQLite file copied to `/tmp` on Vercel | Only writable location on serverless | Writes are per-instance and reset on cold start; production would use Postgres/Turso |
| 11 | Seeded PRNG (mulberry32) | Reproducible data, deterministic tests | Data looks synthetic by nature |
| 12 | Vitest on `:memory:` DBs | Fast, isolated tests with no files | Does not exercise the file-copy path (covered by a small unit test on path logic) |

## Performance
Indexes on every filter/sort column; counts and pages are separate queries; the seed uses one transaction (10k inserts in well under a second).
