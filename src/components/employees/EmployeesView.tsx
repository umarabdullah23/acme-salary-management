"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Drawer,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import type { SortField } from "@/server/domain/employeeSchema";
import { ApiError, removeEmployee, type Employee, type EmployeeMeta, type Page } from "@/lib/api";
import { countryName, formatMoney, formatNumber, formatUsd } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import { EmployeeForm } from "./EmployeeForm";
import { TYPE_LABELS, TYPE_OPTIONS } from "./labels";

const PAGE_SIZE = 25;

interface Filters {
  q: string;
  country: string;
  department: string;
  jobTitle: string;
  type: string;
}

const NO_FILTERS: Filters = { q: "", country: "", department: "", jobTitle: "", type: "" };

function SortableTh({ label, field, sort, order, onSort }: {
  label: string;
  field: SortField;
  sort: SortField;
  order: "asc" | "desc";
  onSort: (field: SortField) => void;
}) {
  const active = sort === field;
  return (
    <Table.Th aria-sort={active ? (order === "asc" ? "ascending" : "descending") : "none"}>
      <Button variant="subtle" color="gray" size="compact-sm" onClick={() => onSort(field)} px={4}>
        {label} {active ? (order === "asc" ? "▲" : "▼") : ""}
      </Button>
    </Table.Th>
  );
}

export function EmployeesView() {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [debouncedQ] = useDebouncedValue(filters.q, 300);
  const [sort, setSort] = useState<SortField>("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [editing, setEditing] = useState<Employee | "new" | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const params = new URLSearchParams({ sort, order, page: String(page), pageSize: String(PAGE_SIZE) });
  const applied = { ...filters, q: debouncedQ };
  for (const [key, value] of Object.entries(applied)) if (value) params.set(key, value);

  const list = useApi<Page<Employee>>(`/api/employees?${params}`, reload);
  const meta = useApi<EmployeeMeta>("/api/meta", reload);

  const setFilter = (key: keyof Filters, value: string | null) => {
    setFilters((f) => ({ ...f, [key]: value ?? "" }));
    setPage(1);
  };

  const onSort = (field: SortField) => {
    if (field === sort) setOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSort(field);
      setOrder("asc");
    }
    setPage(1);
  };

  async function confirmDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await removeEmployee(deleting.id);
      notifications.show({ color: "green", message: `${deleting.fullName} deleted` });
      setDeleting(null);
      setReload((n) => n + 1);
    } catch (error) {
      notifications.show({ color: "red", message: error instanceof ApiError ? error.message : "Delete failed" });
    } finally {
      setDeletingBusy(false);
    }
  }

  const data = list.data;
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>Employees</Title>
          <Text c="dimmed" size="sm">
            {data ? `${formatNumber(data.total)} ${data.total === 1 ? "employee" : "employees"}` : "Loading..."}
          </Text>
        </div>
        <Button onClick={() => setEditing("new")}>Add employee</Button>
      </Group>

      <Paper withBorder p="md">
        <Group align="flex-end" gap="sm">
          <TextInput label="Search" placeholder="Name, email or code" value={filters.q} miw={240}
            onChange={(e) => setFilter("q", e.currentTarget.value)} />
          <Select label="Country" placeholder="All" clearable searchable value={filters.country || null}
            data={(meta.data?.countries ?? []).map((c) => ({ value: c, label: countryName(c) }))}
            onChange={(v) => setFilter("country", v)} w={170} />
          <Select label="Department" placeholder="All" clearable value={filters.department || null}
            data={meta.data?.departments ?? []} onChange={(v) => setFilter("department", v)} w={170} />
          <Select label="Job title" placeholder="All" clearable searchable value={filters.jobTitle || null}
            data={meta.data?.jobTitles ?? []} onChange={(v) => setFilter("jobTitle", v)} w={220} />
          <Select label="Type" placeholder="All" clearable value={filters.type || null}
            data={TYPE_OPTIONS} onChange={(v) => setFilter("type", v)} w={140} />
          {hasFilters && (
            <Button variant="subtle" onClick={() => { setFilters(NO_FILTERS); setPage(1); }}>
              Clear
            </Button>
          )}
        </Group>
      </Paper>

      {list.error && <Alert color="red" title="Could not load employees">{list.error}</Alert>}

      <Paper withBorder pos="relative">
        <LoadingOverlay visible={list.loading} zIndex={5} overlayProps={{ blur: 1 }} />
        <Table.ScrollContainer minWidth={900}>
          <Table highlightOnHover verticalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Code</Table.Th>
                <SortableTh label="Name" field="name" sort={sort} order={order} onSort={onSort} />
                <Table.Th>Job title</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th>Country</Table.Th>
                <SortableTh label="Salary / year" field="salary" sort={sort} order={order} onSort={onSort} />
                <SortableTh label="Hired" field="hireDate" sort={sort} order={order} onSort={onSort} />
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.items.map((e) => (
                <Table.Tr key={e.id}>
                  <Table.Td><Text size="xs" c="dimmed">{e.employeeCode}</Text></Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>{e.fullName}</Text>
                    <Text size="xs" c="dimmed">{e.email}</Text>
                  </Table.Td>
                  <Table.Td>
                    {e.jobTitle}
                    {e.employmentType !== "full_time" && (
                      <Badge ml={6} size="xs" variant="light" color="gray">{TYPE_LABELS[e.employmentType]}</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>{e.department}</Table.Td>
                  <Table.Td>{countryName(e.country)}</Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>{formatMoney(e.salary, e.currency, e.country)}</Text>
                    {e.currency !== "USD" && <Text size="xs" c="dimmed">{formatUsd(e.salaryUsd)}</Text>}
                  </Table.Td>
                  <Table.Td>{e.hireDate}</Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap" justify="flex-end">
                      <Button variant="subtle" size="compact-sm" aria-label={`Edit ${e.fullName}`}
                        onClick={() => setEditing(e)}>
                        Edit
                      </Button>
                      <Button variant="subtle" color="red" size="compact-sm" aria-label={`Delete ${e.fullName}`}
                        onClick={() => setDeleting(e)}>
                        Delete
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {data && data.items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <Text ta="center" c="dimmed" py="xl">No employees match these filters.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {data && data.totalPages > 1 && (
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Page {data.page} of {formatNumber(data.totalPages)}
          </Text>
          <Pagination value={data.page} total={data.totalPages} onChange={setPage} siblings={1} />
        </Group>
      )}

      <Drawer opened={editing !== null} onClose={() => setEditing(null)} position="right" size="md"
        title={editing === "new" ? "Add employee" : "Edit employee"}>
        {editing !== null && (
          <EmployeeForm
            employee={editing === "new" ? null : editing}
            meta={meta.data}
            onCancel={() => setEditing(null)}
            onSaved={() => { setEditing(null); setReload((n) => n + 1); }}
          />
        )}
      </Drawer>

      <Modal opened={deleting !== null} onClose={() => setDeleting(null)} title="Delete employee?" centered>
        <Text size="sm">
          This permanently removes <b>{deleting?.fullName}</b> ({deleting?.employeeCode}) and their salary record.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button color="red" loading={deletingBusy} onClick={confirmDelete}>Delete</Button>
        </Group>
      </Modal>
    </Stack>
  );
}
