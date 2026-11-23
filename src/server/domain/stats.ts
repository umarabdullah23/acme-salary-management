export interface SalaryStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  median: number;
}

/** Median of a numeric list (average of the middle pair when even). Returns 0 for empty input. */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted[mid - 1] ?? 0;
  const upper = sorted[mid] ?? 0;
  return sorted.length % 2 === 0 ? (lower + upper) / 2 : upper;
}

export function summarise(values: readonly number[]): SalaryStats {
  if (values.length === 0) return { count: 0, min: 0, max: 0, avg: 0, median: 0 };
  let min = values[0] ?? 0;
  let max = min;
  let sum = 0;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  return { count: values.length, min, max, avg: Math.round(sum / values.length), median: median(values) };
}

export interface Band {
  from: number;
  to: number | null;
  count: number;
}

/** Histogram with fixed-width bands and an open-ended last band. */
export function histogram(values: readonly number[], width: number, bands: number): Band[] {
  const result: Band[] = Array.from({ length: bands }, (_, i) => ({
    from: i * width,
    to: i === bands - 1 ? null : (i + 1) * width,
    count: 0,
  }));
  for (const v of values) {
    const index = Math.min(Math.floor(v / width), bands - 1);
    const band = result[Math.max(index, 0)];
    if (band) band.count += 1;
  }
  return result;
}
