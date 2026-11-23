import type { Db } from "../db/connection";
import { validationError } from "../domain/errors";
import { findCountry } from "../domain/fx";
import { histogram, median, summarise, type Band, type SalaryStats } from "../domain/stats";

export interface Summary {
  headcount: number;
  payrollUsd: number;
  meanSalaryUsd: number;
  medianSalaryUsd: number;
}

export interface CountryInsight {
  country: string;
  countryName: string;
  currency: string;
  headcount: number;
  local: SalaryStats;
  usd: SalaryStats;
}

export interface JobTitleInsight {
  jobTitle: string;
  currency: string;
  headcount: number;
  local: SalaryStats;
  usd: SalaryStats;
}

export interface DepartmentInsight {
  department: string;
  headcount: number;
  avgSalaryUsd: number;
  payrollUsd: number;
}

export const DISTRIBUTION_WIDTH_USD = 20_000;
export const DISTRIBUTION_BANDS = 10;

interface SalaryRow {
  key: string;
  salary: number;
  salary_usd: number;
}

function groupSalaries(rows: SalaryRow[]): Map<string, { local: number[]; usd: number[] }> {
  const groups = new Map<string, { local: number[]; usd: number[] }>();
  for (const row of rows) {
    const group = groups.get(row.key) ?? { local: [], usd: [] };
    group.local.push(row.salary);
    group.usd.push(row.salary_usd);
    groups.set(row.key, group);
  }
  return groups;
}

export class InsightsService {
  constructor(private readonly db: Db) {}

  summary(): Summary {
    const usd = this.usdSalaries();
    const payroll = usd.reduce((sum, v) => sum + v, 0);
    return {
      headcount: usd.length,
      payrollUsd: payroll,
      meanSalaryUsd: usd.length ? Math.round(payroll / usd.length) : 0,
      medianSalaryUsd: median(usd),
    };
  }

  byCountry(): CountryInsight[] {
    const rows = this.db
      .prepare("SELECT country AS key, salary, salary_usd FROM employees")
      .all() as SalaryRow[];
    const currencies = this.currencyByCountry();
    return [...groupSalaries(rows)]
      .map(([code, group]) => ({
        country: code,
        countryName: findCountry(code)?.name ?? code,
        currency: currencies.get(code) ?? "USD",
        headcount: group.local.length,
        local: summarise(group.local),
        usd: summarise(group.usd),
      }))
      .sort((a, b) => b.headcount - a.headcount);
  }

  byJobTitle(country: unknown): JobTitleInsight[] {
    const code = typeof country === "string" ? country.trim().toUpperCase() : "";
    const known = findCountry(code);
    if (!known) throw validationError("A supported country query parameter is required");
    const rows = this.db
      .prepare("SELECT job_title AS key, salary, salary_usd FROM employees WHERE country = ?")
      .all(code) as SalaryRow[];
    return [...groupSalaries(rows)]
      .map(([jobTitle, group]) => ({
        jobTitle,
        currency: known.currency,
        headcount: group.local.length,
        local: summarise(group.local),
        usd: summarise(group.usd),
      }))
      .sort((a, b) => a.jobTitle.localeCompare(b.jobTitle));
  }

  byDepartment(): DepartmentInsight[] {
    const rows = this.db
      .prepare(
        `SELECT department, COUNT(*) AS headcount, SUM(salary_usd) AS payroll
         FROM employees GROUP BY department ORDER BY department`,
      )
      .all() as { department: string; headcount: number; payroll: number }[];
    return rows.map((r) => ({
      department: r.department,
      headcount: r.headcount,
      avgSalaryUsd: Math.round(r.payroll / r.headcount),
      payrollUsd: r.payroll,
    }));
  }

  distribution(): Band[] {
    return histogram(this.usdSalaries(), DISTRIBUTION_WIDTH_USD, DISTRIBUTION_BANDS);
  }

  private usdSalaries(): number[] {
    return (this.db.prepare("SELECT salary_usd FROM employees").all() as { salary_usd: number }[]).map(
      (r) => r.salary_usd,
    );
  }

  private currencyByCountry(): Map<string, string> {
    const rows = this.db.prepare("SELECT DISTINCT country, currency FROM employees").all() as {
      country: string;
      currency: string;
    }[];
    return new Map(rows.map((r) => [r.country, r.currency]));
  }
}
