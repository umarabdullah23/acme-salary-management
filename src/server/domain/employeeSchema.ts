import { z } from "zod";
import { currencyForCountry } from "./fx";
import { EMPLOYMENT_TYPES } from "./types";

const text = (label: string, max = 120) =>
  z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(max, `${label} is too long`);

export const employeeInputSchema = z.object({
  fullName: text("Full name"),
  email: z.string({ error: "Email is required" }).trim().toLowerCase().max(160).pipe(z.email("Email is invalid")),
  jobTitle: text("Job title"),
  department: text("Department"),
  country: z
    .string({ error: "Country is required" })
    .trim()
    .toUpperCase()
    .refine((c) => currencyForCountry(c) !== undefined, "Country is not supported"),
  salary: z
    .number({ error: "Salary must be a number" })
    .int("Salary must be a whole number")
    .positive("Salary must be greater than zero")
    .max(2_000_000_000, "Salary is too large"),
  employmentType: z.enum(EMPLOYMENT_TYPES, { error: "Employment type is invalid" }),
  hireDate: z
    .string({ error: "Hire date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Hire date must be YYYY-MM-DD")
    .refine((d) => !Number.isNaN(Date.parse(d)), "Hire date is invalid"),
});

export type EmployeeInput = z.infer<typeof employeeInputSchema>;

export const SORT_FIELDS = ["name", "salary", "hireDate"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  country: z.string().trim().toUpperCase().optional(),
  department: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  type: z.enum(EMPLOYMENT_TYPES).optional(),
  sort: z.enum(SORT_FIELDS).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export type ListQuery = z.infer<typeof listQuerySchema>;
