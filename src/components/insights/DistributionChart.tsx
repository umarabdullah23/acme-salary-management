import { Box, Group, Stack, Text } from "@mantine/core";
import type { Band } from "@/lib/api";
import { formatBand, formatNumber } from "@/lib/format";

const CHART_HEIGHT = 220;

export function DistributionChart({ bands }: { bands: Band[] }) {
  const max = Math.max(1, ...bands.map((b) => b.count));
  const total = bands.reduce((sum, b) => sum + b.count, 0);

  return (
    <Group
      align="flex-end"
      wrap="nowrap"
      gap="xs"
      role="img"
      aria-label={`Salary distribution in USD across ${formatNumber(total)} employees`}
    >
      {bands.map((band) => {
        const label = formatBand(band.from, band.to);
        return (
          <Stack key={label} gap={4} align="center" style={{ flex: 1, minWidth: 0 }}>
            <Text size="xs" c="dimmed">
              {formatNumber(band.count)}
            </Text>
            <Box
              title={`${label}: ${formatNumber(band.count)} employees`}
              bg="indigo.5"
              w="100%"
              h={Math.max(2, Math.round((band.count / max) * CHART_HEIGHT))}
              style={{ borderRadius: "4px 4px 0 0" }}
            />
            <Text size="xs" ta="center" style={{ whiteSpace: "nowrap" }}>
              {label}
            </Text>
          </Stack>
        );
      })}
    </Group>
  );
}
