import type { Db } from "../db/connection";
import { formatEmployeeCode } from "../domain/employeeCode";
import { employeeInputSchema, type EmployeeInput } from "../domain/employeeSchema";
import { conflictError, notFoundError, validationError } from "../domain/errors";
import { currencyForCountry, toUsd } from "../domain/fx";
import type { Employee } from "../domain/types";
import { EmployeeRepository, type EmployeeChanges } from "../repository/employeeRepository";

export class EmployeeService {
  private readonly repo: EmployeeRepository;

  constructor(
    private readonly db: Db,
    private readonly clock: () => Date = () => new Date(),
  ) {
    this.repo = new EmployeeRepository(db);
  }

  create(raw: unknown): Employee {
    const input = parseInput(raw);
    return this.guardUnique(() =>
      this.db.transaction(() =>
        this.repo.insert(
          { ...toChanges(input), employeeCode: formatEmployeeCode(this.repo.nextId()) },
          this.now(),
        ),
      )(),
    );
  }

  get(id: number): Employee {
    const found = this.repo.findById(id);
    if (!found) throw notFoundError(`Employee ${id} not found`);
    return found;
  }

  update(id: number, raw: unknown): Employee {
    const input = parseInput(raw);
    const updated = this.guardUnique(() => this.repo.update(id, toChanges(input), this.now()));
    if (!updated) throw notFoundError(`Employee ${id} not found`);
    return updated;
  }

  delete(id: number): void {
    if (!this.repo.delete(id)) throw notFoundError(`Employee ${id} not found`);
  }

  private now(): string {
    return this.clock().toISOString();
  }

  private guardUnique<T>(action: () => T): T {
    try {
      return action();
    } catch (error) {
      if (isUniqueViolation(error)) throw conflictError("An employee with this email already exists");
      throw error;
    }
  }
}

function parseInput(raw: unknown): EmployeeInput {
  const result = employeeInputSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    throw validationError("Invalid employee data", details);
  }
  return result.data;
}

function toChanges(input: EmployeeInput): EmployeeChanges {
  const currency = currencyForCountry(input.country);
  if (!currency) throw validationError("Country is not supported");
  return { ...input, currency, salaryUsd: toUsd(input.salary, currency) };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Error && "code" in error && String((error as { code: unknown }).code).startsWith("SQLITE_CONSTRAINT")
  );
}
