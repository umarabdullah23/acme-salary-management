export type ErrorCode = "VALIDATION_ERROR" | "NOT_FOUND" | "CONFLICT";

export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export const validationError = (message: string, details?: unknown) =>
  new DomainError("VALIDATION_ERROR", message, details);
export const notFoundError = (message: string) => new DomainError("NOT_FOUND", message);
export const conflictError = (message: string) => new DomainError("CONFLICT", message);
