import { FX_RATES_TO_USD, findCountry } from "../domain/fx";

export interface JobTitle {
  title: string;
  department: string;
  /** Relative frequency in the org. */
  weight: number;
  /** Annual pay band for a US employee, in USD. */
  usdMin: number;
  usdMax: number;
}

export const JOB_TITLES: readonly JobTitle[] = [
  { title: "Software Engineer", department: "Engineering", weight: 18, usdMin: 80_000, usdMax: 130_000 },
  { title: "Senior Software Engineer", department: "Engineering", weight: 8, usdMin: 120_000, usdMax: 190_000 },
  { title: "QA Engineer", department: "Engineering", weight: 5, usdMin: 60_000, usdMax: 100_000 },
  { title: "DevOps Engineer", department: "Engineering", weight: 4, usdMin: 95_000, usdMax: 150_000 },
  { title: "Engineering Manager", department: "Engineering", weight: 2, usdMin: 160_000, usdMax: 230_000 },
  { title: "Data Analyst", department: "Data", weight: 5, usdMin: 65_000, usdMax: 110_000 },
  { title: "Product Manager", department: "Product", weight: 4, usdMin: 110_000, usdMax: 175_000 },
  { title: "UX Designer", department: "Design", weight: 4, usdMin: 70_000, usdMax: 120_000 },
  { title: "Account Executive", department: "Sales", weight: 9, usdMin: 60_000, usdMax: 120_000 },
  { title: "Sales Manager", department: "Sales", weight: 3, usdMin: 100_000, usdMax: 170_000 },
  { title: "Marketing Specialist", department: "Marketing", weight: 6, usdMin: 50_000, usdMax: 95_000 },
  { title: "HR Specialist", department: "People", weight: 4, usdMin: 50_000, usdMax: 90_000 },
  { title: "Recruiter", department: "People", weight: 3, usdMin: 50_000, usdMax: 95_000 },
  { title: "Accountant", department: "Finance", weight: 5, usdMin: 55_000, usdMax: 100_000 },
  { title: "Financial Analyst", department: "Finance", weight: 4, usdMin: 70_000, usdMax: 120_000 },
  { title: "Operations Manager", department: "Operations", weight: 4, usdMin: 85_000, usdMax: 140_000 },
  { title: "Customer Support Specialist", department: "Support", weight: 12, usdMin: 35_000, usdMax: 65_000 },
];

/** Cost-of-pay multiplier relative to the US band. */
export const COUNTRY_PAY_FACTOR: Readonly<Record<string, number>> = {
  US: 1,
  IN: 0.28,
  GB: 0.78,
  DE: 0.82,
  PK: 0.2,
  BR: 0.32,
  CA: 0.85,
  AU: 0.88,
};

export const COUNTRY_WEIGHTS: Readonly<Record<string, number>> = {
  US: 22,
  IN: 24,
  GB: 10,
  DE: 10,
  PK: 10,
  BR: 8,
  CA: 8,
  AU: 8,
};

export const SALARY_STEP = 1000;

export interface Band {
  min: number;
  max: number;
}

/** Local-currency yearly band for a title in a country, rounded to SALARY_STEP. */
export function bandFor(countryCode: string, title: JobTitle): Band {
  const country = findCountry(countryCode);
  const factor = COUNTRY_PAY_FACTOR[countryCode];
  const rate = country ? FX_RATES_TO_USD[country.currency] : undefined;
  if (!country || factor === undefined || rate === undefined) throw new Error(`No pay band for ${countryCode}`);
  const toLocal = (usd: number) => Math.round((usd * factor) / rate / SALARY_STEP) * SALARY_STEP;
  return { min: toLocal(title.usdMin), max: toLocal(title.usdMax) };
}
