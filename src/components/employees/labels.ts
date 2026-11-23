import { EMPLOYMENT_TYPES, type EmploymentType } from "@/server/domain/types";

export const TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contractor: "Contractor",
};

export const TYPE_OPTIONS = EMPLOYMENT_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] }));
