import { describe, expect, it } from "vitest";
import { employeeInputSchema, listQuerySchema } from "@/server/domain/employeeSchema";
import { formatEmployeeCode } from "@/server/domain/employeeCode";
import { currencyForCountry, toUsd } from "@/server/domain/fx";
import { histogram, median, summarise } from "@/server/domain/stats";

const valid = {
  fullName: "  Asha Rao ",
  email: "Asha.Rao@Example.com",
  jobTitle: "Software Engineer",
  department: "Engineering",
  country: "in",
  salary: 2_400_000,
  employmentType: "full_time",
  hireDate: "2022-04-01",
};

describe("employeeInputSchema", () => {
  it("normalises valid input", () => {
    const parsed = employeeInputSchema.parse(valid);
    expect(parsed.fullName).toBe("Asha Rao");
    expect(parsed.email).toBe("asha.rao@example.com");
    expect(parsed.country).toBe("IN");
  });

  it.each([
    ["email", { email: "nope" }],
    ["country", { country: "ZZ" }],
    ["salary", { salary: -5 }],
    ["salary", { salary: 10.5 }],
    ["employmentType", { employmentType: "intern" }],
    ["hireDate", { hireDate: "01/02/2020" }],
    ["fullName", { fullName: "   " }],
  ])("rejects invalid %s", (field, patch) => {
    const result = employeeInputSchema.safeParse({ ...valid, ...patch });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((i) => i.path[0] === field)).toBe(true);
  });
});

describe("listQuerySchema", () => {
  it("applies defaults and coerces numbers", () => {
    const q = listQuerySchema.parse({ page: "3" });
    expect(q).toMatchObject({ page: 3, pageSize: 25, sort: "name", order: "asc" });
  });

  it("rejects page size above the cap", () => {
    expect(listQuerySchema.safeParse({ pageSize: "500" }).success).toBe(false);
  });
});

describe("fx", () => {
  it("normalises to USD with rounding", () => {
    expect(toUsd(1_000_000, "INR")).toBe(12_000);
    expect(toUsd(50_000, "USD")).toBe(50_000);
  });

  it("throws for unknown currency and maps country to currency", () => {
    expect(() => toUsd(1, "XXX")).toThrow();
    expect(currencyForCountry("DE")).toBe("EUR");
    expect(currencyForCountry("ZZ")).toBeUndefined();
  });
});

describe("stats", () => {
  it("computes median for odd, even and empty lists", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBe(0);
  });

  it("summarises values", () => {
    expect(summarise([10, 20, 60])).toEqual({ count: 3, min: 10, max: 60, avg: 30, median: 20 });
    expect(summarise([]).count).toBe(0);
  });

  it("builds a histogram with an open last band", () => {
    const bands = histogram([5, 15, 25, 999], 10, 3);
    expect(bands.map((b) => b.count)).toEqual([1, 1, 2]);
    expect(bands[2]?.to).toBeNull();
  });
});

describe("employee code", () => {
  it("pads to six digits", () => {
    expect(formatEmployeeCode(123)).toBe("ACME-000123");
  });

  it("rejects invalid sequences", () => {
    expect(() => formatEmployeeCode(0)).toThrow(RangeError);
  });
});
