import { Money } from "./money";

export type FinancialEventType =
  | "INVOICE_CREATED"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "REFUND_ISSUED"
  | "CREDIT_APPLIED"
  | "SUBSCRIPTION_CHANGED"
  | "PERIOD_CLOSED";

export interface FinancialAuditEvent {
  eventId: string;
  companyId: string;
  actorUserId: string;
  transactionId: string;
  eventType: FinancialEventType;
  entityType: string;
  entityId: string;
  action: string;
  money?: Money;
  previousState?: string;
  newState?: string;
  timestamp: string;
}

const ledger: FinancialAuditEvent[] = [];

export function recordFinancialAuditEvent(
  input: Omit<FinancialAuditEvent, "eventId" | "timestamp">
): FinancialAuditEvent {
  const event: FinancialAuditEvent = {
    ...input,
    eventId: `fin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  ledger.unshift(event);
  if (ledger.length > 200) {
    ledger.pop();
  }

  return event;
}

export function getFinancialAuditLedger(companyId?: string): FinancialAuditEvent[] {
  if (!companyId) return ledger;
  return ledger.filter((evt) => evt.companyId === companyId);
}

export function clearFinancialLedger(): void {
  ledger.length = 0;
}
