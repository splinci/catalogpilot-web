import { logger } from "./logger";

export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "AUTH_FAILURE"
  | "ACCESS_DENIED"
  | "PERMISSION_ESCALATION_ATTEMPT"
  | "CROSS_TENANT_VIOLATION"
  | "API_KEY_REVOKED"
  | "SUSPICIOUS_REQUEST"
  | "SECRET_ACCESS_ATTEMPT";

export interface SecurityAuditEvent {
  eventId: string;
  eventType: SecurityEventType;
  timestamp: string;
  companyId: string;
  actorUserId?: string;
  requestId?: string;
  route?: string;
  action?: string;
  resource?: string;
  result: "GRANTED" | "DENIED" | "BLOCKED";
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details?: string;
}

const auditEvents: SecurityAuditEvent[] = [];

export function recordSecurityAuditEvent(
  eventInput: Omit<SecurityAuditEvent, "eventId" | "timestamp">
): SecurityAuditEvent {
  const event: SecurityAuditEvent = {
    ...eventInput,
    eventId: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  auditEvents.unshift(event);
  if (auditEvents.length > 100) {
    auditEvents.pop();
  }

  if (event.riskLevel === "CRITICAL" || event.riskLevel === "HIGH") {
    logger.error(`SECURITY EVENT [${event.riskLevel}]: ${event.eventType}`, {
      errorCode: "SECURITY_AUDIT_EVENT",
      ...event,
    });
  }

  return event;
}

export function getSecurityAuditEvents(companyId?: string): SecurityAuditEvent[] {
  if (!companyId) return auditEvents;
  return auditEvents.filter((evt) => evt.companyId === companyId);
}

export function clearSecurityAuditEvents(): void {
  auditEvents.length = 0;
}
