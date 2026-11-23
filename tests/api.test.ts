import { beforeEach, describe, expect, it } from "vitest";
import { createApi, errorResult, queryToObject, type Api } from "@/server/api/api";
import { seedDatabase } from "@/server/seed/seedDatabase";
import { memoryDb, sample } from "./helpers";

interface Json { [key: string]: unknown }
const body = (r: { body: unknown }) => r.body as Json;

describe("employee API handlers", () => {
  let api: Api;

  beforeEach(() => {
    api = createApi(memoryDb());
  });

  it("creates (201), reads, updates and deletes an employee", () => {
    const created = api.createEmployee(sample);
    expect(created.status).toBe(201);
    const id = String(body(created).id);

    expect(api.getEmployee(id).status).toBe(200);
    const updated = api.updateEmployee(id, { ...sample, salary: 3_000_000 });
    expect(updated.status).toBe(200);
    expect(body(updated).salary).toBe(3_000_000);

    expect(api.deleteEmployee(id)).toEqual({ status: 200, body: { deleted: true } });
    expect(api.getEmployee(id).status).toBe(404);
  });

  it("returns 400 with field details on validation errors", () => {
    const result = api.createEmployee({ ...sample, email: "nope" });
    expect(result.status).toBe(400);
    expect(body(result).error).toMatchObject({
      code: "VALIDATION_ERROR",
      details: [{ field: "email" }],
    });
  });

  it("returns 400 for malformed ids and bad query parameters", () => {
    expect(api.getEmployee("abc").status).toBe(400);
    expect(api.listEmployees({ page: "0" }).status).toBe(400);
  });

  it("returns 409 for a duplicate email and 404 for missing records", () => {
    api.createEmployee(sample);
    expect(api.createEmployee(sample).status).toBe(409);
    expect(api.updateEmployee("42", sample).status).toBe(404);
    expect(api.deleteEmployee("42").status).toBe(404);
  });

  it("lists with paging and returns filter metadata", () => {
    api.createEmployee(sample);
    const list = api.listEmployees({ q: "asha" });
    expect(list.status).toBe(200);
    expect(body(list).total).toBe(1);
    expect(body(api.meta())).toMatchObject({ countries: ["IN"] });
  });
});

describe("insights API handlers", () => {
  it("serves all insight endpoints from a seeded database", () => {
    const db = memoryDb();
    seedDatabase(db, 300, 3);
    const api = createApi(db);
    expect(body(api.summary())).toMatchObject({ headcount: 300 });
    expect(Array.isArray(api.byCountry().body)).toBe(true);
    expect(Array.isArray(api.byDepartment().body)).toBe(true);
    expect(Array.isArray(api.distribution().body)).toBe(true);
    expect((api.byJobTitle("US").body as unknown[]).length).toBeGreaterThan(0);
    expect(api.byJobTitle(undefined).status).toBe(400);
  });
});

describe("helpers", () => {
  it("drops empty query values", () => {
    expect(queryToObject(new URLSearchParams("q=&country=IN&page=2"))).toEqual({ country: "IN", page: "2" });
  });

  it("hides unexpected error details behind a 500", () => {
    const result = errorResult(new Error("secret db path"));
    expect(result.status).toBe(500);
    expect(JSON.stringify(result.body)).not.toContain("secret");
  });
});
