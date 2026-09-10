import { SecurityIdentity, evaluateSecurityContext, SecurityRequestEnvelope } from "./securityContext";
import { recordSecurityAuditEvent } from "../observability/securityAuditEvents";

export class SecurityPolicyEngine {
  static enforceRequest(
    identity: SecurityIdentity | null,
    envelope: SecurityRequestEnvelope
  ): SecurityIdentity {
    const evalResult = evaluateSecurityContext(identity, envelope);

    if (!evalResult.allowed) {
      recordSecurityAuditEvent({
        eventType: evalResult.riskLevel === "CRITICAL" ? "CROSS_TENANT_VIOLATION" : "ACCESS_DENIED",
        companyId: identity?.companyId || "UNKNOWN",
        actorUserId: identity?.userId || "ANONYMOUS",
        requestId: envelope.requestId,
        route: envelope.route,
        action: envelope.method,
        resource: envelope.targetCompanyId || "N/A",
        result: "DENIED",
        riskLevel: evalResult.riskLevel,
        details: evalResult.reason,
      });

      throw new Error(evalResult.reason);
    }

    return evalResult.identity;
  }
}
