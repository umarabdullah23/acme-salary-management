"use client";

import { useState } from "react";
import { Alert, Group, Loader, Paper, Select, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { COUNTRIES } from "@/server/domain/fx";
import type { Band, CountryInsight, DepartmentInsight, JobTitleInsight, Summary } from "@/lib/api";
import { countryName, formatCompactUsd, formatMoney, formatNumber, formatUsd } from "@/lib/format";
import { useApi } from "@/lib/useApi";
import { DistributionChart } from "./DistributionChart";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Paper withBorder p="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fz={28} fw={650} mt={4}>
        {value}
      </Text>
      {hint && (
        <Text size="xs" c="dimmed">
          {hint}
        </Text>
      )}
    </Paper>
  );
}

function Section({ title, description, action, children }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper withBorder p="md">
      <Group justify="space-between" align="flex-start" mb="sm">
        <div>
          <Title order={4}>{title}</Title>
          {description && (
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          )}
        </div>
        {action}
      </Group>
      {children}
    </Paper>
  );
}

const num = { style: { textAlign: "right" as const } };

function CountryTable({ rows }: { rows: CountryInsight[] }) {
  return (
    <Table.ScrollContainer minWidth={820}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Country</Table.Th>
            <Table.Th {...num}>Headcount</Table.Th>
            <Table.Th {...num}>Min</Table.Th>
            <Table.Th {...num}>Average</Table.Th>
            <Table.Th {...num}>Median</Table.Th>
            <Table.Th {...num}>Max</Table.Th>
            <Table.Th {...num}>Avg (USD)</Table.Th>
            <Table.Th {...num}>Median (USD)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((r) => (
            <Table.Tr key={r.country}>
              <Table.Td>
                {r.countryName} <Text span c="dimmed" size="xs">{r.currency}</Text>
              </Table.Td>
              <Table.Td {...num}>{formatNumber(r.headcount)}</Table.Td>
              <Table.Td {...num}>{formatMoney(r.local.min, r.currency, r.country)}</Table.Td>
              <Table.Td {...num}>{formatMoney(r.local.avg, r.currency, r.country)}</Table.Td>
              <Table.Td {...num}>{formatMoney(r.local.median, r.currency, r.country)}</Table.Td>
              <Table.Td {...num}>{formatMoney(r.local.max, r.currency, r.country)}</Table.Td>
              <Table.Td {...num}>{formatUsd(r.usd.avg)}</Table.Td>
              <Table.Td {...num}>{formatUsd(r.usd.median)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function JobTitleTable({ rows, country }: { rows: JobTitleInsight[]; country: string }) {
  return (
    <Table.ScrollContainer minWidth={720}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Job title</Table.Th>
            <Table.Th {...num}>Headcount</Table.Th>
            <Table.Th {...num}>Min</Table.Th>
            <Table.Th {...num}>Average</Table.Th>
            <Table.Th {...num}>Median</Table.Th>
            <Table.Th {...num}>Max</Table.Th>
            <Table.Th {...num}>Avg (USD)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((r) => (
            <Table.Tr key={r.jobTitle}>
              <Table.Td>{r.jobTitle}</Table.Td>
              <Table.Td {...num}>{formatNumber(r.headcount)}</Table.Td>
              <Table.Td {...num}>{formatMoney(r.local.min, r.currency, country)}</Table.Td>
              <Table.Td {...num}>{formatMoney(r.local.avg, r.currency, country)}</Table.Td>
              <Table.Td {...num}>{formatMoney(r.local.median, r.currency, country)}</Table.Td>
              <Table.Td {...num}>{formatMoney(r.local.max, r.currency, country)}</Table.Td>
              <Table.Td {...num}>{formatUsd(r.usd.avg)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}

function DepartmentTable({ rows }: { rows: DepartmentInsight[] }) {
  return (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Department</Table.Th>
          <Table.Th {...num}>Headcount</Table.Th>
          <Table.Th {...num}>Avg salary (USD)</Table.Th>
          <Table.Th {...num}>Payroll (USD)</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((r) => (
          <Table.Tr key={r.department}>
            <Table.Td>{r.department}</Table.Td>
            <Table.Td {...num}>{formatNumber(r.headcount)}</Table.Td>
            <Table.Td {...num}>{formatUsd(r.avgSalaryUsd)}</Table.Td>
            <Table.Td {...num}>{formatCompactUsd(r.payrollUsd)}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

const Loading = () => (
  <Group justify="center" py="lg">
    <Loader size="sm" />
  </Group>
);

export function InsightsView() {
  const [country, setCountry] = useState("US");
  const summary = useApi<Summary>("/api/insights/summary");
  const byCountry = useApi<CountryInsight[]>("/api/insights/by-country");
  const byDepartment = useApi<DepartmentInsight[]>("/api/insights/by-department");
  const distribution = useApi<Band[]>("/api/insights/distribution");
  const byTitle = useApi<JobTitleInsight[]>(`/api/insights/by-job-title?country=${country}`);

  const failure = summary.error ?? byCountry.error ?? byDepartment.error ?? distribution.error ?? byTitle.error;
  const s = summary.data;

  return (
    <Stack gap="md">
      <div>
        <Title order={2}>Insights</Title>
        <Text c="dimmed" size="sm">
          How ACME pays its people. Org-wide figures are normalised to USD using static reference FX rates.
        </Text>
      </div>

      {failure && <Alert color="red" title="Could not load insights">{failure}</Alert>}

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
        <StatCard label="Headcount" value={s ? formatNumber(s.headcount) : "-"} />
        <StatCard label="Annual payroll" value={s ? formatCompactUsd(s.payrollUsd) : "-"}
          hint={s ? formatUsd(s.payrollUsd) : undefined} />
        <StatCard label="Mean salary" value={s ? formatUsd(s.meanSalaryUsd) : "-"} hint="USD per year" />
        <StatCard label="Median salary" value={s ? formatUsd(s.medianSalaryUsd) : "-"} hint="USD per year" />
      </SimpleGrid>

      <Section title="Salary distribution" description="Employees per USD salary band">
        {distribution.data ? <DistributionChart bands={distribution.data} /> : <Loading />}
      </Section>

      <Section title="By country" description="Local-currency statistics, with USD averages for comparison">
        {byCountry.data ? <CountryTable rows={byCountry.data} /> : <Loading />}
      </Section>

      <Section
        title="By job title"
        description={`What ACME pays each role in ${countryName(country)}`}
        action={
          <Select aria-label="Country" w={200} allowDeselect={false} value={country}
            data={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
            onChange={(v) => v && setCountry(v)} />
        }
      >
        {byTitle.data ? <JobTitleTable rows={byTitle.data} country={country} /> : <Loading />}
      </Section>

      <Section title="By department" description="Headcount and average salary in USD">
        {byDepartment.data ? <DepartmentTable rows={byDepartment.data} /> : <Loading />}
      </Section>
    </Stack>
  );
}
