import { describe, expect, it } from "vitest";
import { COUNTRIES } from "@/server/domain/fx";
import { employeeInputSchema } from "@/server/domain/employeeSchema";
import { generateEmployees, SEED_COUNT } from "@/server/seed/generate";
import { seedDatabase } from "@/server/seed/seedDatabase";
import { bandFor, JOB_TITLES } from "@/server/seed/titles";
import { createRng } from "@/server/seed/random";
import { memoryDb } from "./helpers";

describe("generateEmployees", () => {
  const employees = generateEmployees();

  it("generates exactly 10,000 employees", () => {
    expect(employees).toHaveLength(SEED_COUNT);
    expect(SEED_COUNT).toBe(10_000);
  });

  it("is deterministic for the same seed and differs for another", () => {
    expect(generateEmployees(200, 7)).toEqual(generateEmployees(200, 7));
    expect(generateEmployees(200, 7)).not.toEqual(generateEmployees(200, 8));
  });

  it("keeps every salary inside the title's band for its country", () => {
    for (const e of employees) {
      const title = JOB_TITLES.find((t) => t.title === e.jobTitle);
      expect(title).toBeDefined();
      if (!title) continue;
      const band = bandFor(e.country, title);
      expect(e.salary).toBeGreaterThanOrEqual(band.min);
      expect(e.salary).toBeLessThanOrEqual(band.max);
    }
  });

  it("covers all countries with unique emails and codes", () => {
    expect(new Set(employees.map((e) => e.country))).toEqual(new Set(COUNTRIES.map((c) => c.code)));
    expect(new Set(employees.map((e) => e.email)).size).toBe(SEED_COUNT);
    expect(new Set(employees.map((e) => e.employeeCode)).size).toBe(SEED_COUNT);
  });

  it("produces records that satisfy the API validation schema", () => {
    for (const e of employees.slice(0, 500)) {
      expect(employeeInputSchema.safeParse(e).success).toBe(true);
    }
  });
});

describe("seedDatabase", () => {
  it("inserts the requested count and is idempotent", () => {
    const db = memoryDb();
    expect(seedDatabase(db, 150, 1)).toBe(150);
    expect(seedDatabase(db, 150, 1)).toBe(150);
    expect((db.prepare("SELECT COUNT(*) AS n FROM employees").get() as { n: number }).n).toBe(150);
  });
});

describe("rng", () => {
  it("throws when picking from an empty list", () => {
    expect(() => createRng(1).pick([])).toThrow();
    expect(() => createRng(1).weighted([])).toThrow();
  });
});
