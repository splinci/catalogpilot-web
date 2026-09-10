export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "VOID" | "WRITTEN_OFF";

const VALID_INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["ISSUED", "VOID"],
  ISSUED: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"],
  PARTIALLY_PAID: ["PAID", "OVERDUE", "WRITTEN_OFF"],
  OVERDUE: ["PARTIALLY_PAID", "PAID", "WRITTEN_OFF", "VOID"],
  PAID: [], // Terminal state
  VOID: [], // Terminal state
  WRITTEN_OFF: [], // Terminal state
};

export function validateInvoiceTransition(
  current: InvoiceStatus,
  target: InvoiceStatus
): { valid: boolean; reason?: string } {
  if (current === target) return { valid: true };

  const allowed = VALID_INVOICE_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      reason: `Prohibited invoice transition from '${current}' to '${target}'.`,
    };
  }

  return { valid: true };
}
