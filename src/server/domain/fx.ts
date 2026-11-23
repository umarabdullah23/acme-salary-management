export interface Country {
  code: string;
  name: string;
  currency: string;
  locale: string;
}

export const COUNTRIES: readonly Country[] = [
  { code: "US", name: "United States", currency: "USD", locale: "en-US" },
  { code: "IN", name: "India", currency: "INR", locale: "en-IN" },
  { code: "GB", name: "United Kingdom", currency: "GBP", locale: "en-GB" },
  { code: "DE", name: "Germany", currency: "EUR", locale: "de-DE" },
  { code: "PK", name: "Pakistan", currency: "PKR", locale: "en-PK" },
  { code: "BR", name: "Brazil", currency: "BRL", locale: "pt-BR" },
  { code: "CA", name: "Canada", currency: "CAD", locale: "en-CA" },
  { code: "AU", name: "Australia", currency: "AUD", locale: "en-AU" },
];

/** Static, dated reference rates: 1 unit of currency in USD. */
export const FX_AS_OF = "2025-01-01";
export const FX_RATES_TO_USD: Readonly<Record<string, number>> = {
  USD: 1,
  INR: 0.012,
  GBP: 1.27,
  EUR: 1.08,
  PKR: 0.0036,
  BRL: 0.17,
  CAD: 0.74,
  AUD: 0.65,
};

export function findCountry(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code);
}

export function currencyForCountry(code: string): string | undefined {
  return findCountry(code)?.currency;
}

export function toUsd(amount: number, currency: string): number {
  const rate = FX_RATES_TO_USD[currency];
  if (rate === undefined) throw new Error(`Unknown currency: ${currency}`);
  return Math.round(amount * rate);
}
