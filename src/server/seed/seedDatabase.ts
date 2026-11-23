import type { Db } from "../db/connection";
import { generateEmployees, SEEDED_AT } from "./generate";

/** Replaces all employees with a deterministic dataset, in a single transaction. */
export function seedDatabase(db: Db, count?: number, seed?: number): number {
  const employees = generateEmployees(count, seed);
  const insert = db.prepare(
    `INSERT INTO employees (id, employee_code, full_name, email, job_title, department, country,
       currency, salary, salary_usd, employment_type, hire_date, created_at, updated_at)
     VALUES (@id, @employeeCode, @fullName, @email, @jobTitle, @department, @country,
       @currency, @salary, @salaryUsd, @employmentType, @hireDate, @at, @at)`,
  );
  db.transaction(() => {
    db.exec("DELETE FROM employees");
    employees.forEach((employee, index) => insert.run({ ...employee, id: index + 1, at: SEEDED_AT }));
  })();
  return employees.length;
}
