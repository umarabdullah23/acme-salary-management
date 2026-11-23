import { beforeEach, describe, expect, it } from "vitest";
import { EmployeeService } from "@/server/services/employeeService";
import { InsightsService } from "@/server/services/insightsService";
import { memoryDb, sample } from "./helpers";

/**
 * Hand-made fixture with known answers.
 *  US Software Engineer: 100k, 120k, 200k  -> min 100k, max 200k, avg 140k, median 120k
 *  US Recruiter: 60k
 *  IN Software Engineer: 1,000,000 and 2,000,000 INR = 12k and 24k USD
 *  DE Recruiter: 50,000 EUR = 54,000 USD
 */
const fixture = [
  { country: "US", jobTitle: "Software Engineer", department: "Engineering", salary: 100_000 },
  { country: "US", jobTitle: "Software Engineer", department: "Engineering", salary: 120_000 },
  { country: "US", jobTitle: "Software Engineer", department: "Engineering", salary: 200_000 },
  { country: "US", jobTitle: "Recruiter", department: "People", salary: 60_000 },
  { country: "IN", jobTitle: "Software Engineer", department: "Engineering", salary: 1_000_000 },
  { country: "IN", jobTitle: "Software Engineer", department: "Engineering", salary: 2_000_000 },
  { country: "DE", jobTitle: "Recruiter", department: "People", salary: 50_000 },
];

describe("InsightsService", () => {
  let insights: InsightsService;

  beforeEach(() => {
    const db = memoryDb();
    const employees = new EmployeeService(db);
    fixture.forEach((f, i) => employees.create({ ...sample, ...f, email: `p${i}@x.com` }));
    insights = new InsightsService(db);
  });

  it("computes org summary in USD", () => {
    // USD: 100k,120k,200k,60k,12k,24k,54k = 570k
    expect(insights.summary()).toEqual({
      headcount: 7,
      payrollUsd: 570_000,
      meanSalaryUsd: 81_429,
      medianSalaryUsd: 60_000,
    });
  });

  it("computes per-country stats in local currency and USD", () => {
    const byCountry = insights.byCountry();
    expect(byCountry.map((c) => c.country)).toEqual(["US", "IN", "DE"]);
    const us = byCountry[0];
    expect(us).toMatchObject({ currency: "USD", countryName: "United States", headcount: 4 });
    expect(us?.local).toEqual({ count: 4, min: 60_000, max: 200_000, avg: 120_000, median: 110_000 });
    const india = byCountry[1];
    expect(india?.local).toMatchObject({ min: 1_000_000, max: 2_000_000, avg: 1_500_000, median: 1_500_000 });
    expect(india?.usd).toMatchObject({ min: 12_000, max: 24_000, avg: 18_000 });
  });

  it("answers 'what do we pay a Software Engineer in the US'", () => {
    const rows = insights.byJobTitle("us");
    expect(rows.map((r) => r.jobTitle)).toEqual(["Recruiter", "Software Engineer"]);
    const engineer = rows[1];
    expect(engineer).toMatchObject({ headcount: 3, currency: "USD" });
    expect(engineer?.local).toEqual({ count: 3, min: 100_000, max: 200_000, avg: 140_000, median: 120_000 });
  });

  it("requires a valid country for job-title insights", () => {
    expect(() => insights.byJobTitle(undefined)).toThrowError(expect.objectContaining({ code: "VALIDATION_ERROR" }));
    expect(() => insights.byJobTitle("ZZ")).toThrowError(expect.objectContaining({ code: "VALIDATION_ERROR" }));
  });

  it("aggregates by department", () => {
    expect(insights.byDepartment()).toEqual([
      { department: "Engineering", headcount: 5, avgSalaryUsd: 91_200, payrollUsd: 456_000 },
      { department: "People", headcount: 2, avgSalaryUsd: 57_000, payrollUsd: 114_000 },
    ]);
  });

  it("builds a USD distribution that sums to headcount", () => {
    const bands = insights.distribution();
    expect(bands).toHaveLength(10);
    expect(bands.reduce((s, b) => s + b.count, 0)).toBe(7);
    expect(bands[0]).toEqual({ from: 0, to: 20_000, count: 1 });
    expect(bands[9]).toMatchObject({ from: 180_000, to: null, count: 1 });
  });

  it("handles an empty database", () => {
    const empty = new InsightsService(memoryDb());
    expect(empty.summary()).toEqual({ headcount: 0, payrollUsd: 0, meanSalaryUsd: 0, medianSalaryUsd: 0 });
    expect(empty.byCountry()).toEqual([]);
  });
});
