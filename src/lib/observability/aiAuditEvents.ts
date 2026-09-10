export type AiAuditEventType =
  | "AI_REQUEST_CREATED"
  | "AI_REQUEST_BLOCKED"
  | "AI_INPUT_REDACTED"
  | "AI_PROMPT_INJECTION_DETECTED"
  | "AI_MODEL_REJECTED"
  | "AI_OUTPUT_VALIDATION_FAILED"
  | "AI_APPROVAL_REQUIRED"
  | "AI_APPROVAL_GRANTED"
  | "AI_APPROVAL_REJECTED"
  | "AI_JOB_COMPLETED"
  | "AI_JOB_FAILED"
  | "AI_USAGE_LIMIT_EXCEEDED"
  | "AI_PROVIDER_CIRCUIT_OPEN";

export interface AiAuditEvent {
  eventId: string;
  eventType: AiAuditEventType;
  companyId: string;
  actorUserId?: string;
  requestId?: string;
  jobId?: string;
  provider?: string;
  model?: string;
  operation?: string;
  riskLevel: "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK" | "CRITICAL_RISK";
  result: "SUCCESS" | "BLOCKED" | "FAILED" | "REJECTED";
  timestamp: string;
}

const aiAuditEvents: AiAuditEvent[] = [];

export function recordAiAuditEvent(
  input: Omit<AiAuditEvent, "eventId" | "timestamp">
): AiAuditEvent {
  const event: AiAuditEvent = {
    ...input,
    eventId: `ai_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  aiAuditEvents.unshift(event);
  if (aiAuditEvents.length > 200) {
    aiAuditEvents.pop();
  }

  return event;
}

export function getAiAuditEvents(companyId?: string): AiAuditEvent[] {
  if (!companyId) return aiAuditEvents;
  return aiAuditEvents.filter((evt) => evt.companyId === companyId);
}

export function clearAiAuditEvents(): void {
  aiAuditEvents.length = 0;
}
