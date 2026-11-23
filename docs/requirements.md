# Requirements: ACME Salary Management

## Goal
ACME's HR manager currently keeps salary data for 10,000 employees in Excel. Replace that with a web app that lets the HR manager (a) maintain employee salary records and (b) answer "how do we pay people?" without building pivot tables.

## Persona
One HR manager, trusted with all data. Works on a laptop, mostly searches, edits one record at a time, and asks comparative questions ("what do we pay a Software Engineer in India?").

## In scope
1. **Employee directory**: server-side paginated table (25/page) with search (name, email, code), filters (country, department, job title, employment type) and sort (name, salary, hire date).
2. **Create / edit / delete** an employee, with validation and a delete confirmation.
3. **Insights**:
   - Org totals: headcount, annual payroll (USD), mean and median salary (USD).
   - By country: headcount and min / max / average / median salary, in local currency and USD.
   - By job title within a country: headcount and min / max / average salary.
   - By department: headcount and average salary (USD).
   - Salary distribution histogram (USD bands).
4. **Multi-currency**: each employee is paid in their country's currency; org-wide numbers are normalised to USD using a static FX table.
5. **Seed**: exactly 10,000 deterministic, realistic employees across ~8 countries.
6. **Deployed** app, with a demo video.

## Deliberately left out (and why)
| Item | Reason |
|---|---|
| Authentication / roles | Single trusted persona; adds scope without answering the core question. Would be the first next step. |
| Salary history and raise workflow | Needs a time-versioned model; current salary is enough to answer the stated questions. |
| Payroll processing, tax, benefits | Different problem domain. |
| CSV import / export | Useful for migrating off Excel; seed stands in for it. Listed as next step. |
| Live FX rates | Static dated rates keep results reproducible and tests deterministic. |
| Audit log | Valuable once auth exists. |
| Multi-tenancy | One organisation (ACME). |

## Non-functional
- Directory and insights respond in well under a second on 10,000 rows (indexes, SQL aggregation, server-side paging).
- Backend logic is framework-independent TypeScript with fast deterministic unit tests (target >85% line coverage on server code).
- Writes on the deployed demo are per-instance and reset on cold start (SQLite on serverless); documented trade-off.

## Success criteria
The HR manager can find any employee in seconds, edit their salary, and read off per-country and per-title pay ranges and the org payroll total.
