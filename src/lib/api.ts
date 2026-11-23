import type { Employee, Page } from "@/server/domain/types";
import type { EmployeeInput } from "@/server/domain/employeeSchema";
import type { EmployeeMeta } from "@/server/repository/employeeQuery";
import type {
  CountryInsight,
  DepartmentInsight,
  JobTitleInsight,
  Summary,
} from "@/server/services/insightsService";
import type { Band } from "@/server/domain/stats";

export type {
  Employee,
  Page,
  EmployeeInput,
  EmployeeMeta,
  CountryInsight,
  DepartmentInsight,
  JobTitleInsight,
  Summary,
  Band,
};

export interface FieldIssue {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: FieldIssue[] = [],
  ) {
    super(message);
  }
}

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: { code: string; message: string; details?: FieldIssue[] };
  };
  if (!response.ok) {
    const e = payload.error;
    throw new ApiError(response.status, e?.code ?? "ERROR", e?.message ?? "Request failed", e?.details);
  }
  return payload as T;
}

export const saveEmployee = (input: EmployeeInput, id?: number) =>
  request<Employee>(id ? `/api/employees/${id}` : "/api/employees", {
    method: id ? "PUT" : "POST",
    body: JSON.stringify(input),
  });

export const removeEmployee = (id: number) =>
  request<{ deleted: true }>(`/api/employees/${id}`, { method: "DELETE" });
