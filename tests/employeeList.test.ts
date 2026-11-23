import { beforeEach, describe, expect, it } from "vitest";
import { EmployeeService } from "@/server/services/employeeService";
import { memoryDb, sample } from "./helpers";

const people = [
  { ...sample, fullName: "Zoe Adams", email: "zoe@x.com", country: "US", salary: 150_000, hireDate: "2020-01-01" },
  { ...sample, fullName: "bob Brown", email: "bob@x.com", country: "US", salary: 90_000, hireDate: "2023-05-01", department: "Sales", jobTitle: "Account Executive" },
  { ...sample, fullName: "Carl Chen", email: "carl@x.com", country: "IN", salary: 3_000_000, hireDate: "2021-07-01" },
  { ...sample, fullName: "Dana 100%", email: "dana@x.com", country: "DE", salary: 70_000, hireDate: "2019-03-01", employmentType: "contractor" },
];

describe("EmployeeService.list", () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService(memoryDb());
    people.forEach((p) => service.create(p));
  });

  const names = (raw: unknown) => service.list(raw).items.map((e) => e.fullName);

  it("sorts by name case-insensitively by default", () => {
    expect(names({})).toEqual(["bob Brown", "Carl Chen", "Dana 100%", "Zoe Adams"]);
  });

  it("sorts by salary using USD so currencies compare fairly", () => {
    // Carl: 3,000,000 INR = 36,000 USD; Dana: 70,000 EUR = 75,600 USD
    expect(names({ sort: "salary", order: "desc" })).toEqual(["Zoe Adams", "bob Brown", "Dana 100%", "Carl Chen"]);
  });

  it("sorts by hire date", () => {
    expect(names({ sort: "hireDate" })[0]).toBe("Dana 100%");
  });

  it("searches name, email and code", () => {
    expect(names({ q: "zoe" })).toEqual(["Zoe Adams"]);
    expect(names({ q: "carl@x" })).toEqual(["Carl Chen"]);
    expect(names({ q: "ACME-000004" })).toEqual(["Dana 100%"]);
  });

  it("treats LIKE wildcards literally", () => {
    expect(names({ q: "100%" })).toEqual(["Dana 100%"]);
    expect(names({ q: "%" })).toEqual(["Dana 100%"]);
  });

  it("filters by country, department, title and type and combines filters", () => {
    expect(names({ country: "us" })).toEqual(["bob Brown", "Zoe Adams"]);
    expect(names({ country: "US", department: "Sales" })).toEqual(["bob Brown"]);
    expect(names({ jobTitle: "Account Executive" })).toEqual(["bob Brown"]);
    expect(names({ type: "contractor" })).toEqual(["Dana 100%"]);
    expect(names({ country: "IN", type: "contractor" })).toEqual([]);
  });

  it("paginates and reports totals", () => {
    const page2 = service.list({ page: 2, pageSize: 3 });
    expect(page2).toMatchObject({ total: 4, page: 2, pageSize: 3, totalPages: 2 });
    expect(page2.items.map((e) => e.fullName)).toEqual(["Zoe Adams"]);
  });

  it("returns one empty page when nothing matches", () => {
    expect(service.list({ q: "nobody" })).toMatchObject({ items: [], total: 0, totalPages: 1 });
  });

  it("rejects invalid query parameters", () => {
    expect(() => service.list({ sort: "bogus" })).toThrowError(expect.objectContaining({ code: "VALIDATION_ERROR" }));
  });

  it("returns distinct filter options", () => {
    expect(service.meta()).toEqual({
      countries: ["DE", "IN", "US"],
      departments: ["Engineering", "Sales"],
      jobTitles: ["Account Executive", "Software Engineer"],
    });
  });
});
