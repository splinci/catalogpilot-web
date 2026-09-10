export type FailoverState =
  | "PRIMARY"
  | "DEGRADED"
  | "FAILING_OVER"
  | "SECONDARY_ACTIVE"
  | "RESTORING_PRIMARY"
  | "NORMALIZED";

const VALID_FAILOVER_TRANSITIONS: Record<FailoverState, FailoverState[]> = {
  PRIMARY: ["DEGRADED", "FAILING_OVER"],
  DEGRADED: ["FAILING_OVER", "PRIMARY"],
  FAILING_OVER: ["SECONDARY_ACTIVE", "PRIMARY"],
  SECONDARY_ACTIVE: ["RESTORING_PRIMARY"],
  RESTORING_PRIMARY: ["NORMALIZED", "SECONDARY_ACTIVE"],
  NORMALIZED: ["PRIMARY"],
};

export function validateFailoverTransition(current: FailoverState, target: FailoverState): void {
  if (current === target) return;

  const allowed = VALID_FAILOVER_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    throw new Error(`UNSAFE_FAILOVER_TRANSITION: Prohibited transition from '${current}' to '${target}'.`);
  }
}
