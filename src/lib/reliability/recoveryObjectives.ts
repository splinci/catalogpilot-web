import { recordSecurityAuditEvent } from "../observability/securityAuditEvents";

export interface RtoEvaluation {
  status: "RTO_MET" | "RTO_BREACHED";
  targetSeconds: number;
  actualSeconds: number;
}

export interface RpoEvaluation {
  status: "RPO_MET" | "RPO_BREACHED";
  targetSeconds: number;
  actualSeconds: number;
}

export function evaluateRTO(targetSeconds: number, actualSeconds: number, companyId = "SYSTEM"): RtoEvaluation {
  const isMet = actualSeconds <= targetSeconds;
  const status = isMet ? "RTO_MET" : "RTO_BREACHED";

  if (!isMet) {
    recordSecurityAuditEvent({
      eventType: "SUSPICIOUS_REQUEST",
      companyId,
      actorUserId: "SYSTEM",
      action: "RTO_BREACH_EVALUATION",
      result: "BLOCKED",
      riskLevel: "HIGH",
      details: `RTO breach detected: Actual recovery time (${actualSeconds}s) exceeded target (${targetSeconds}s).`,
    });
  }

  return { status, targetSeconds, actualSeconds };
}

export function evaluateRPO(targetSeconds: number, actualSeconds: number, companyId = "SYSTEM"): RpoEvaluation {
  const isMet = actualSeconds <= targetSeconds;
  const status = isMet ? "RPO_MET" : "RPO_BREACHED";

  if (!isMet) {
    recordSecurityAuditEvent({
      eventType: "SUSPICIOUS_REQUEST",
      companyId,
      actorUserId: "SYSTEM",
      action: "RPO_BREACH_EVALUATION",
      result: "BLOCKED",
      riskLevel: "CRITICAL",
      details: `RPO breach detected: Actual data loss window (${actualSeconds}s) exceeded target (${targetSeconds}s).`,
    });
  }

  return { status, targetSeconds, actualSeconds };
}
