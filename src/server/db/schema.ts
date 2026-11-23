export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS fx_rates (
  currency    TEXT PRIMARY KEY,
  rate_to_usd REAL NOT NULL,
  as_of       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id              INTEGER PRIMARY KEY,
  employee_code   TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  job_title       TEXT NOT NULL,
  department      TEXT NOT NULL,
  country         TEXT NOT NULL,
  currency        TEXT NOT NULL REFERENCES fx_rates(currency),
  salary          INTEGER NOT NULL CHECK (salary > 0),
  salary_usd      INTEGER NOT NULL CHECK (salary_usd >= 0),
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time','part_time','contractor')),
  hire_date       TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_country      ON employees(country);
CREATE INDEX IF NOT EXISTS idx_employees_department   ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_job_title    ON employees(job_title);
CREATE INDEX IF NOT EXISTS idx_employees_country_title ON employees(country, job_title);
CREATE INDEX IF NOT EXISTS idx_employees_salary_usd   ON employees(salary_usd);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date    ON employees(hire_date);
CREATE INDEX IF NOT EXISTS idx_employees_full_name    ON employees(full_name COLLATE NOCASE);
`;
