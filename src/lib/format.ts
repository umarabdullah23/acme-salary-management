import { findCountry } from "@/server/domain/fx";

export function formatMoney(amount: number, currency: string, country?: string): string {
  const locale = (country && findCountry(country)?.locale) || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatUsd = (amount: number): string => formatMoney(amount, "USD", "US");

export function formatCompactUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export const formatNumber = (n: number): string => new Intl.NumberFormat("en-US").format(n);

export function formatBand(from: number, to: number | null): string {
  const k = (n: number) => `$${n / 1000}k`;
  return to === null ? `${k(from)}+` : `${k(from)}-${k(to)}`;
}

export const countryName = (code: string): string => findCountry(code)?.name ?? code;
