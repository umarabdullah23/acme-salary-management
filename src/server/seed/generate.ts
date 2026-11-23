import { COUNTRIES, FX_AS_OF, toUsd } from "../domain/fx";
import { formatEmployeeCode } from "../domain/employeeCode";
import type { NewEmployee } from "../repository/employeeRepository";
import { NAMES } from "./names";
import { createRng, type Rng } from "./random";
import { bandFor, COUNTRY_WEIGHTS, JOB_TITLES, SALARY_STEP } from "./titles";

export const SEED_COUNT = 10_000;
export const SEED_VALUE = 20250101;
export const SEEDED_AT = `${FX_AS_OF}T00:00:00.000Z`;

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c, weight: COUNTRY_WEIGHTS[c.code] ?? 1 }));
const TITLE_OPTIONS = JOB_TITLES.map((t) => ({ value: t, weight: t.weight }));
const TYPE_OPTIONS = [
  { value: "full_time", weight: 88 },
  { value: "part_time", weight: 7 },
  { value: "contractor", weight: 5 },
] as const;

const HIRE_START = Date.UTC(2012, 0, 1);
const HIRE_END = Date.UTC(2024, 11, 31);
const DAY_MS = 86_400_000;

function slug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function hireDate(rng: Rng): string {
  const days = Math.floor((HIRE_END - HIRE_START) / DAY_MS);
  return new Date(HIRE_START + rng.int(0, days) * DAY_MS).toISOString().slice(0, 10);
}

/** Deterministic: same (count, seed) always yields the same employees. */
export function generateEmployees(count = SEED_COUNT, seed = SEED_VALUE): NewEmployee[] {
  const rng = createRng(seed);
  const usedEmails = new Set<string>();
  const employees: NewEmployee[] = [];

  for (let i = 1; i <= count; i++) {
    const country = rng.weighted(COUNTRY_OPTIONS);
    const title = rng.weighted(TITLE_OPTIONS);
    const pool = NAMES[country.code];
    if (!pool) throw new Error(`No names for ${country.code}`);
    const first = rng.pick(pool.first);
    const last = rng.pick(pool.last);
    const band = bandFor(country.code, title);
    const salary = band.min + rng.int(0, (band.max - band.min) / SALARY_STEP) * SALARY_STEP;

    let email = `${slug(first)}.${slug(last)}@acme.example`;
    for (let n = 2; usedEmails.has(email); n++) email = `${slug(first)}.${slug(last)}${n}@acme.example`;
    usedEmails.add(email);

    employees.push({
      employeeCode: formatEmployeeCode(i),
      fullName: `${first} ${last}`,
      email,
      jobTitle: title.title,
      department: title.department,
      country: country.code,
      currency: country.currency,
      salary,
      salaryUsd: toUsd(salary, country.currency),
      employmentType: rng.weighted(TYPE_OPTIONS),
      hireDate: hireDate(rng),
    });
  }
  return employees;
}
