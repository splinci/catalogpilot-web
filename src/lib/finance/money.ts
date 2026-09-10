export interface Money {
  amountCents: number; // Stored in minor units (e.g., 1000 = $10.00)
  currency: string;    // ISO 4217 code (e.g. "USD", "EUR")
}

export function createMoney(amount: number, currency = "USD"): Money {
  if (isNaN(amount) || !isFinite(amount)) {
    throw new Error("Invalid monetary amount");
  }
  // Convert dollars/units to integer cents safely
  const amountCents = Math.round(amount * 100);
  return { amountCents, currency: currency.toUpperCase() };
}

export function formatMoney(money: Money): string {
  const dollars = (money.amountCents / 100).toFixed(2);
  return `${money.currency} ${dollars}`;
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: Cannot add ${a.currency} and ${b.currency}`);
  }
  return { amountCents: a.amountCents + b.amountCents, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: Cannot subtract ${a.currency} and ${b.currency}`);
  }
  const result = a.amountCents - b.amountCents;
  if (result < 0) {
    throw new Error("Negative monetary balance result prohibited");
  }
  return { amountCents: result, currency: a.currency };
}

export function compareMoney(a: Money, b: Money): number {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: Cannot compare ${a.currency} and ${b.currency}`);
  }
  return a.amountCents - b.amountCents;
}
