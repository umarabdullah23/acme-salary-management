import type { Db } from "../db/connection";
import { DomainError, validationError, type ErrorCode } from "../domain/errors";
import { EmployeeService } from "../services/employeeService";
import { InsightsService } from "../services/insightsService";

export interface ApiResult {
  status: number;
  body: unknown;
}

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

export function errorResult(error: unknown): ApiResult {
  if (error instanceof DomainError) {
    const { code, message, details } = error;
    return { status: STATUS[code], body: { error: { code, message, ...(details ? { details } : {}) } } };
  }
  return { status: 500, body: { error: { code: "INTERNAL_ERROR", message: "Unexpected server error" } } };
}

function run(action: () => ApiResult): ApiResult {
  try {
    return action();
  } catch (error) {
    return errorResult(error);
  }
}

const ok = (body: unknown, status = 200): ApiResult => ({ status, body });

/** Drops empty values so `?country=` means "no filter". */
export function queryToObject(params: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of params) if (value !== "") result[key] = value;
  return result;
}

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw validationError("Employee id must be a positive integer");
  return id;
}

/** Framework-free request handlers; route files only adapt HTTP to these calls. */
export function createApi(db: Db) {
  const employees = new EmployeeService(db);
  const insights = new InsightsService(db);

  return {
    listEmployees: (query: unknown) => run(() => ok(employees.list(query))),
    createEmployee: (body: unknown) => run(() => ok(employees.create(body), 201)),
    getEmployee: (id: string) => run(() => ok(employees.get(parseId(id)))),
    updateEmployee: (id: string, body: unknown) => run(() => ok(employees.update(parseId(id), body))),
    deleteEmployee: (id: string) =>
      run(() => {
        employees.delete(parseId(id));
        return ok({ deleted: true });
      }),
    meta: () => run(() => ok(employees.meta())),
    summary: () => run(() => ok(insights.summary())),
    byCountry: () => run(() => ok(insights.byCountry())),
    byJobTitle: (country: unknown) => run(() => ok(insights.byJobTitle(country))),
    byDepartment: () => run(() => ok(insights.byDepartment())),
    distribution: () => run(() => ok(insights.distribution())),
  };
}

export type Api = ReturnType<typeof createApi>;
