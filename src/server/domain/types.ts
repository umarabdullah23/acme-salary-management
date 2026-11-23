export const EMPLOYMENT_TYPES = ["full_time", "part_time", "contractor"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export interface Employee {
  id: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
