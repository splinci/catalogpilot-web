export type DisasterScenarioType =
  | "DATABASE_FAILURE"
  | "DATABASE_CORRUPTION"
  | "APPLICATION_REGION_FAILURE"
  | "CACHE_STORE_FAILURE"
  | "BACKGROUND_WORKER_FAILURE"
  | "AI_PROVIDER_OUTAGE"
  | "INTEGRATION_PROVIDER_OUTAGE"
  | "WEBHOOK_INFRASTRUCTURE_FAILURE"
  | "ACCIDENTAL_DATA_DELETION"
  | "SECURITY_INCIDENT";

export type RecoveryState = "PLANNED" | "TESTING" | "RECOVERING" | "VALIDATING" | "RECOVERED" | "FAILED" | "ESCALATED";

export interface DisasterRecoveryScenario {
  scenarioId: string;
  scenarioType: DisasterScenarioType;
  description: string;
  criticality: "HIGH" | "CRITICAL" | "MISSION_CRITICAL";
  serviceDependencies: string[];
  recoveryStrategy: string;
  targetRTOSeconds: number;
  targetRPOSeconds: number;
  status: RecoveryState;
}

const VALID_RECOVERY_TRANSITIONS: Record<RecoveryState, RecoveryState[]> = {
  PLANNED: ["TESTING", "RECOVERING", "FAILED"],
  TESTING: ["VALIDATING", "FAILED"],
  RECOVERING: ["VALIDATING", "FAILED", "ESCALATED"],
  VALIDATING: ["RECOVERED", "FAILED", "ESCALATED"],
  RECOVERED: [],
  FAILED: ["RECOVERING", "ESCALATED"],
  ESCALATED: ["RECOVERING"],
};

export function validateRecoveryStateTransition(current: RecoveryState, target: RecoveryState): void {
  if (current === target) return;

  const allowed = VALID_RECOVERY_TRANSITIONS[current] || [];
  if (!allowed.includes(target)) {
    throw new Error(`INVALID_RECOVERY_TRANSITION: Prohibited transition from '${current}' to '${target}'.`);
  }
}
