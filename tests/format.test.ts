import { describe, expect, it } from "vitest";
import { countryName, formatBand, formatCompactUsd, formatMoney, formatUsd } from "@/lib/format";

describe("formatting", () => {
  it("formats money in the right currency without decimals", () => {
    expect(formatUsd(1234567)).toBe("$1,234,567");
    expect(formatMoney(2_400_000, "INR", "IN")).toContain("24,00,000");
    expect(formatMoney(2_400_000, "INR", "IN")).toContain("₹");
    expect(formatMoney(70_000, "EUR", "DE")).toContain("€");
  });

  it("compacts large USD values", () => {
    expect(formatCompactUsd(1_250_000_000)).toBe("$1.3B");
  });

  it("labels distribution bands", () => {
    expect(formatBand(0, 20_000)).toBe("$0k-$20k");
    expect(formatBand(180_000, null)).toBe("$180k+");
  });

  it("resolves country names with a fallback", () => {
    expect(countryName("DE")).toBe("Germany");
    expect(countryName("ZZ")).toBe("ZZ");
  });
});
