import { CONTROL_CATALOG, ControlStatus } from "./controlRegistry";
import { getTenantControlEvidence } from "./evidenceCollector";

export interface ControlEvaluationSummary {
  controlId: string;
  status: ControlStatus;
  lastEvidenceTimestamp?: string;
  reason?: string;
}

export function evaluateContinuousControlStatus(companyId: string): ControlEvaluationSummary[] {
  return CONTROL_CATALOG.map((ctrl) => {
    const evidence = getTenantControlEvidence(companyId, ctrl.controlId);
    if (evidence.length === 0) {
      return {
        controlId: ctrl.controlId,
        status: ctrl.frequency === "CONTINUOUS" ? "NON_COMPLIANT" : "PENDING_REVIEW",
        reason: "No evidence captured for control",
      };
    }

    const latest = evidence[0];
    return {
      controlId: ctrl.controlId,
      status: "COMPLIANT",
      lastEvidenceTimestamp: latest.timestamp,
    };
  });
}
