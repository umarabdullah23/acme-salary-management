import { beforeEach, describe, expect, it } from "vitest";
import { DomainError } from "@/server/domain/errors";
import { EmployeeService } from "@/server/services/employeeService";
import { memoryDb, sample } from "./helpers";

const fixedNow = new Date("2025-02-03T04:05:06.000Z");

describe("EmployeeService CRUD", () => {
  let service: EmployeeService;

  beforeEach(() => {
    service = new EmployeeService(memoryDb(), () => fixedNow);
  });

  it("creates an employee with code, currency and USD salary", () => {
    const created = service.create(sample);
    expect(created).toMatchObject({
      id: 1,
      employeeCode: "ACME-000001",
      currency: "INR",
      salary: 2_400_000,
      salaryUsd: 28_800,
      createdAt: fixedNow.toISOString(),
    });
  });

  it("assigns sequential codes", () => {
    service.create(sample);
    const second = service.create({ ...sample, email: "b@example.com" });
    expect(second.employeeCode).toBe("ACME-000002");
  });

  it("reads back an employee and 404s when missing", () => {
    const { id } = service.create(sample);
    expect(service.get(id).email).toBe("asha.rao@example.com");
    expect(() => service.get(999)).toThrowError(expect.objectContaining({ code: "NOT_FOUND" }));
  });

  it("reports validation details", () => {
    try {
      service.create({ ...sample, salary: -1, email: "bad" });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      const details = (error as DomainError).details as { field: string }[];
      expect(details.map((d) => d.field).sort()).toEqual(["email", "salary"]);
    }
  });

  it("maps duplicate email to a conflict on create and update", () => {
    service.create(sample);
    const other = service.create({ ...sample, email: "other@example.com" });
    expect(() => service.create(sample)).toThrowError(expect.objectContaining({ code: "CONFLICT" }));
    expect(() => service.update(other.id, sample)).toThrowError(expect.objectContaining({ code: "CONFLICT" }));
  });

  it("updates salary, recomputes USD and currency", () => {
    const { id } = service.create(sample);
    const updated = service.update(id, { ...sample, country: "US", salary: 100_000 });
    expect(updated).toMatchObject({ currency: "USD", salaryUsd: 100_000, employeeCode: "ACME-000001" });
  });

  it("404s on updating or deleting a missing employee", () => {
    expect(() => service.update(5, sample)).toThrowError(expect.objectContaining({ code: "NOT_FOUND" }));
    expect(() => service.delete(5)).toThrowError(expect.objectContaining({ code: "NOT_FOUND" }));
  });

  it("deletes an employee", () => {
    const { id } = service.create(sample);
    service.delete(id);
    expect(() => service.get(id)).toThrow(DomainError);
  });
});
