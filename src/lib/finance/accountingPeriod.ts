export type AccountingPeriodState = "OPEN" | "CLOSING" | "CLOSED";

export interface AccountingPeriod {
  periodKey: string; // e.g. "2026-Q1" or "2026-08"
  companyId: string;
  state: AccountingPeriodState;
  closedAt?: string;
  closedByUserId?: string;
}

const periods = new Map<string, AccountingPeriod>();

function buildPeriodKey(companyId: string, periodKey: string): string {
  return `${companyId}:${periodKey}`;
}

export function setAccountingPeriodState(
  companyId: string,
  periodKey: string,
  state: AccountingPeriodState,
  userId?: string
): AccountingPeriod {
  const fullKey = buildPeriodKey(companyId, periodKey);
  const period: AccountingPeriod = {
    periodKey,
    companyId,
    state,
    ...(state === "CLOSED" && { closedAt: new Date().toISOString(), closedByUserId: userId }),
  };

  periods.set(fullKey, period);
  return period;
}

export function validateFinancialMutationInPeriod(companyId: string, periodKey: string): void {
  const fullKey = buildPeriodKey(companyId, periodKey);
  const period = periods.get(fullKey);

  if (period && period.state === "CLOSED") {
    throw new Error(`Financial mutation rejected. Accounting period '${periodKey}' is CLOSED.`);
  }
}

export function clearAccountingPeriods(): void {
  periods.clear();
}
