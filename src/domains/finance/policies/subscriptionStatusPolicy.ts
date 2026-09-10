export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED" | "CANCELLED";

const VALID_SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  TRIAL: ["ACTIVE", "CANCELLED", "SUSPENDED"],
  ACTIVE: ["PAST_DUE", "SUSPENDED", "CANCELLED"],
  PAST_DUE: ["ACTIVE", "SUSPENDED", "CANCELLED"],
  SUSPENDED: ["ACTIVE", "CANCELLED"],
  CANCELLED: [], // Terminal state
};

export function validateSubscriptionTransition(
  current: SubscriptionStatus,
  target: SubscriptionStatus
): { valid: boolean; reason?: string } {
  if (current === target) return { valid: true };

  const allowed = VALID_SUBSCRIPTION_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    return {
      valid: false,
      reason: `Prohibited subscription transition from '${current}' to '${target}'.`,
    };
  }

  return { valid: true };
}
