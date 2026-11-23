# AI log

Tool: Claude Sonnet as the implementation agent, working from `docs/ai/00-build-brief.md` (stack, data model, API, tests, working rules were fixed up front by the human). Short, honest notes on decisions and corrections.

## Process
- Asked the agent to write `docs/requirements.md` first and commit it before any code; then architecture and decisions docs. Accepted the structure, kept the out-of-scope table because each item has a reason.
- Asked for small vertical slices: domain -> schema/CRUD -> list/filter -> seed -> insights -> API handlers -> route handlers -> UI. Each commit gated on `npm run typecheck && npm test`.
- Asked for TDD-style tests alongside each slice, using `:memory:` SQLite and hand-computed fixtures so expected values are known independently of the code.

## Decisions made
- Store `salary_usd` at write time (indexable, simple sorting/aggregates across currencies) instead of joining `fx_rates` on every query. Trade-off: recompute if rates change.
- Medians computed in TypeScript from one scan per group, because SQLite has no `MEDIAN` and the window-function SQL is harder to read and test. Fine at 10k rows.
- Backend HTTP logic lives in `src/server/api/api.ts` as plain functions returning `{status, body}`; Next route files are 3-line adapters. This makes API tests call handlers directly with no Next runtime.
- Pages are static shells that fetch JSON from the API, so no page touches the DB at build time. The DB is only read by route handlers.
- Seed bands: each title has a US USD band; each country has a pay factor; local bands are derived and rounded to 1,000 units, so every salary is verifiably inside its country/title band (tested for all 10,000 rows).
- Chart is a small CSS bar chart instead of a charting library: one fewer dependency, easy to make accessible.

## Corrections (things the first draft got wrong)
- First schema idea was a `.sql` file read at runtime; changed to an embedded TS string so it is bundled into serverless output without file tracing.
- Typecheck caught `resolveDbLocation` taking `NodeJS.ProcessEnv` (requires `NODE_ENV`); loosened to a read-only string record so tests can pass plain objects.
- My hand-computed distribution test expected 2 employees in the first band; the fixture has one value below $20k and one in the next band. Fixed the test expectation (the code was right), after recomputing the fixture by hand.
- ESLint's `react-hooks/set-state-in-effect` rejected the first `useApi` (setState for `loading` inside the effect). Rewrote it so `loading` is derived from whether the latest request key has settled.
- `next build` warned that dynamic `fs` calls in `getDb()` make Turbopack trace the whole project. Added `turbopackIgnore` hints and verified the route `.nft.json` includes `data/acme.db` and not the whole repo.
- Pinned ESLint to v9 because `eslint-config-next` ships flat configs targeting it; avoided debugging a major-version mismatch.
- An early UI draft used letter placeholders ("E", "D") for row actions; replaced with labelled Edit/Delete buttons rather than adding an icon dependency.
- Empty query params (`?country=`) would have been rejected or treated as filters; added `queryToObject` to drop empty values, with a test.

## Verification the human can repeat
`npm run typecheck && npm run lint && npm test && npm run test:coverage && npm run build && npm start`
