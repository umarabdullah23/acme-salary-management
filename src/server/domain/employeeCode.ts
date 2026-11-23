export const EMPLOYEE_CODE_PATTERN = /^ACME-\d{6}$/;

export function formatEmployeeCode(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new RangeError("Employee sequence must be a positive integer");
  }
  return `ACME-${String(sequence).padStart(6, "0")}`;
}
