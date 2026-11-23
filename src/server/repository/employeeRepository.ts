import type { Db } from "../db/connection";
import type { Employee, EmploymentType } from "../domain/types";

interface EmployeeRow {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  salary_usd: number;
  employment_type: EmploymentType;
  hire_date: string;
  created_at: string;
  updated_at: string;
}

export interface NewEmployee {
  employeeCode: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  currency: string;
  salary: number;
  salaryUsd: number;
  employmentType: EmploymentType;
  hireDate: string;
}

export type EmployeeChanges = Omit<NewEmployee, "employeeCode">;

export const EMPLOYEE_COLUMNS = `id, employee_code, full_name, email, job_title, department, country,
  currency, salary, salary_usd, employment_type, hire_date, created_at, updated_at`;

export function mapEmployee(row: EmployeeRow): Employee {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    fullName: row.full_name,
    email: row.email,
    jobTitle: row.job_title,
    department: row.department,
    country: row.country,
    currency: row.currency,
    salary: row.salary,
    salaryUsd: row.salary_usd,
    employmentType: row.employment_type,
    hireDate: row.hire_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class EmployeeRepository {
  constructor(private readonly db: Db) {}

  nextId(): number {
    const row = this.db.prepare("SELECT COALESCE(MAX(id), 0) + 1 AS next FROM employees").get() as {
      next: number;
    };
    return row.next;
  }

  insert(employee: NewEmployee, now: string): Employee {
    const result = this.db
      .prepare(
        `INSERT INTO employees (employee_code, full_name, email, job_title, department, country,
           currency, salary, salary_usd, employment_type, hire_date, created_at, updated_at)
         VALUES (@employeeCode, @fullName, @email, @jobTitle, @department, @country,
           @currency, @salary, @salaryUsd, @employmentType, @hireDate, @now, @now)`,
      )
      .run({ ...employee, now });
    return this.mustFind(Number(result.lastInsertRowid));
  }

  findById(id: number): Employee | undefined {
    const row = this.db.prepare(`SELECT ${EMPLOYEE_COLUMNS} FROM employees WHERE id = ?`).get(id) as
      | EmployeeRow
      | undefined;
    return row ? mapEmployee(row) : undefined;
  }

  update(id: number, changes: EmployeeChanges, now: string): Employee | undefined {
    const result = this.db
      .prepare(
        `UPDATE employees SET full_name=@fullName, email=@email, job_title=@jobTitle,
           department=@department, country=@country, currency=@currency, salary=@salary,
           salary_usd=@salaryUsd, employment_type=@employmentType, hire_date=@hireDate,
           updated_at=@now WHERE id=@id`,
      )
      .run({ ...changes, id, now });
    return result.changes === 0 ? undefined : this.findById(id);
  }

  delete(id: number): boolean {
    return this.db.prepare("DELETE FROM employees WHERE id = ?").run(id).changes > 0;
  }

  count(): number {
    return (this.db.prepare("SELECT COUNT(*) AS n FROM employees").get() as { n: number }).n;
  }

  private mustFind(id: number): Employee {
    const found = this.findById(id);
    if (!found) throw new Error(`Employee ${id} vanished after write`);
    return found;
  }
}
