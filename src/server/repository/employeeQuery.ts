import type { Db } from "../db/connection";
import type { ListQuery, SortField } from "../domain/employeeSchema";
import type { Employee, Page } from "../domain/types";
import { EMPLOYEE_COLUMNS, mapEmployee } from "./employeeRepository";

const SORT_SQL: Record<SortField, string> = {
  name: "full_name COLLATE NOCASE",
  salary: "salary_usd",
  hireDate: "hire_date",
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function buildWhere(query: ListQuery): { sql: string; params: Record<string, string> } {
  const clauses: string[] = [];
  const params: Record<string, string> = {};
  if (query.q) {
    clauses.push(
      "(full_name LIKE @q ESCAPE '\\' OR email LIKE @q ESCAPE '\\' OR employee_code LIKE @q ESCAPE '\\')",
    );
    params.q = `%${escapeLike(query.q)}%`;
  }
  const equals: [string, string | undefined, string][] = [
    ["country", query.country, "country"],
    ["department", query.department, "department"],
    ["job_title", query.jobTitle, "jobTitle"],
    ["employment_type", query.type, "type"],
  ];
  for (const [column, value, param] of equals) {
    if (!value) continue;
    clauses.push(`${column} = @${param}`);
    params[param] = value;
  }
  return { sql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export function listEmployees(db: Db, query: ListQuery): Page<Employee> {
  const { sql, params } = buildWhere(query);
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM employees ${sql}`).get(params) as { n: number }).n;
  const direction = query.order === "desc" ? "DESC" : "ASC";
  const rows = db
    .prepare(
      `SELECT ${EMPLOYEE_COLUMNS} FROM employees ${sql}
       ORDER BY ${SORT_SQL[query.sort]} ${direction}, id ASC LIMIT @limit OFFSET @offset`,
    )
    .all({ ...params, limit: query.pageSize, offset: (query.page - 1) * query.pageSize });
  return {
    items: (rows as Parameters<typeof mapEmployee>[0][]).map(mapEmployee),
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export interface EmployeeMeta {
  countries: string[];
  departments: string[];
  jobTitles: string[];
}

export function loadMeta(db: Db): EmployeeMeta {
  const distinct = (column: string): string[] =>
    (db.prepare(`SELECT DISTINCT ${column} AS v FROM employees ORDER BY v`).all() as { v: string }[]).map(
      (r) => r.v,
    );
  return {
    countries: distinct("country"),
    departments: distinct("department"),
    jobTitles: distinct("job_title"),
  };
}
