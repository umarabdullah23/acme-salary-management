"use client";

import { useState } from "react";
import { Alert, Autocomplete, Button, Group, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { employeeInputSchema } from "@/server/domain/employeeSchema";
import { COUNTRIES, currencyForCountry } from "@/server/domain/fx";
import { ApiError, saveEmployee, type Employee, type EmployeeMeta } from "@/lib/api";
import { TYPE_OPTIONS } from "./labels";

interface Props {
  employee: Employee | null;
  meta: EmployeeMeta | undefined;
  onSaved: () => void;
  onCancel: () => void;
}

interface Values {
  fullName: string;
  email: string;
  jobTitle: string;
  department: string;
  country: string;
  salary: number | string;
  employmentType: string;
  hireDate: string;
}

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.currency})` }));

function initialValues(employee: Employee | null): Values {
  return {
    fullName: employee?.fullName ?? "",
    email: employee?.email ?? "",
    jobTitle: employee?.jobTitle ?? "",
    department: employee?.department ?? "",
    country: employee?.country ?? "US",
    salary: employee?.salary ?? "",
    employmentType: employee?.employmentType ?? "full_time",
    hireDate: employee?.hireDate ?? new Date().toISOString().slice(0, 10),
  };
}

export function EmployeeForm({ employee, meta, onSaved, onCancel }: Props) {
  const [values, setValues] = useState<Values>(() => initialValues(employee));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));
  const currency = currencyForCountry(values.country) ?? "";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(undefined);
    const parsed = employeeInputSchema.safeParse({
      ...values,
      salary: values.salary === "" ? undefined : Number(values.salary),
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await saveEmployee(parsed.data, employee?.id);
      notifications.show({ color: "green", message: employee ? "Employee updated" : "Employee created" });
      onSaved();
    } catch (error) {
      if (error instanceof ApiError && error.details.length) {
        setErrors(Object.fromEntries(error.details.map((d) => [d.field, d.message])));
      } else {
        setFormError(error instanceof ApiError ? error.message : "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      <Stack gap="sm">
        {formError && <Alert color="red">{formError}</Alert>}
        <TextInput label="Full name" required value={values.fullName} error={errors.fullName}
          onChange={(e) => set("fullName", e.currentTarget.value)} />
        <TextInput label="Email" type="email" required value={values.email} error={errors.email}
          onChange={(e) => set("email", e.currentTarget.value)} />
        <Autocomplete label="Job title" required data={meta?.jobTitles ?? []} value={values.jobTitle}
          error={errors.jobTitle} onChange={(v) => set("jobTitle", v)} />
        <Autocomplete label="Department" required data={meta?.departments ?? []} value={values.department}
          error={errors.department} onChange={(v) => set("department", v)} />
        <Select label="Country" required data={COUNTRY_OPTIONS} value={values.country} error={errors.country}
          allowDeselect={false} onChange={(v) => v && set("country", v)} />
        <NumberInput label={`Annual salary (${currency})`} required min={0} thousandSeparator=","
          allowDecimal={false} value={values.salary} error={errors.salary}
          onChange={(v) => set("salary", v)} />
        <Select label="Employment type" required data={TYPE_OPTIONS} value={values.employmentType}
          error={errors.employmentType} allowDeselect={false} onChange={(v) => v && set("employmentType", v)} />
        <TextInput label="Hire date" type="date" required value={values.hireDate} error={errors.hireDate}
          onChange={(e) => set("hireDate", e.currentTarget.value)} />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {employee ? "Save changes" : "Create employee"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
