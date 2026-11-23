import { openDatabase, type Db } from "@/server/db/connection";

export const sample = {
  fullName: "Asha Rao",
  email: "asha.rao@example.com",
  jobTitle: "Software Engineer",
  department: "Engineering",
  country: "IN",
  salary: 2_400_000,
  employmentType: "full_time",
  hireDate: "2022-04-01",
} as const;

export const memoryDb = (): Db => openDatabase(":memory:");
