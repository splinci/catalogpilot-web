import { AiActionRiskLevel } from "./types";

export function requiresHumanApproval(riskLevel: AiActionRiskLevel): boolean {
  return riskLevel === "HIGH_RISK" || riskLevel === "CRITICAL_RISK";
}

export function validateAutonomousExecutionAllowed(riskLevel: AiActionRiskLevel): void {
  if (requiresHumanApproval(riskLevel)) {
    throw new Error(
      `HUMAN_APPROVAL_REQUIRED: Operation classified as ${riskLevel} cannot be executed autonomously by AI without human approval.`
    );
  }
}
