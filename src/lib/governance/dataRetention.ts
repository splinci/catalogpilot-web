export type RetentionCategory =
  | "AUDIT_LOGS"
  | "SECURITY_EVENTS"
  | "API_REQUEST_LOGS"
  | "INTEGRATION_SYNC_HISTORY"
  | "WEBHOOK_DELIVERY_HISTORY"
  | "WORKFLOW_EXECUTIONS"
  | "AI_JOB_HISTORY"
  | "OPERATIONAL_METRICS";

export interface RetentionPolicy {
  category: RetentionCategory;
  retentionDays: number;
  archiveBeforeDelete: boolean;
  description: string;
}

export const RETENTION_POLICIES: Record<RetentionCategory, RetentionPolicy> = {
  AUDIT_LOGS: { category: "AUDIT_LOGS", retentionDays: 365, archiveBeforeDelete: true, description: "Compliance audit logs retained for 1 year" },
  SECURITY_EVENTS: { category: "SECURITY_EVENTS", retentionDays: 365, archiveBeforeDelete: true, description: "Security incident telemetry retained for 1 year" },
  API_REQUEST_LOGS: { category: "API_REQUEST_LOGS", retentionDays: 30, archiveBeforeDelete: false, description: "API request logs purged after 30 days" },
  INTEGRATION_SYNC_HISTORY: { category: "INTEGRATION_SYNC_HISTORY", retentionDays: 90, archiveBeforeDelete: true, description: "Integration sync logs retained for 90 days" },
  WEBHOOK_DELIVERY_HISTORY: { category: "WEBHOOK_DELIVERY_HISTORY", retentionDays: 30, archiveBeforeDelete: false, description: "Webhook delivery history purged after 30 days" },
  WORKFLOW_EXECUTIONS: { category: "WORKFLOW_EXECUTIONS", retentionDays: 60, archiveBeforeDelete: true, description: "Workflow execution history retained for 60 days" },
  AI_JOB_HISTORY: { category: "AI_JOB_HISTORY", retentionDays: 30, archiveBeforeDelete: false, description: "AI job history purged after 30 days" },
  OPERATIONAL_METRICS: { category: "OPERATIONAL_METRICS", retentionDays: 90, archiveBeforeDelete: false, description: "System operational telemetry retained for 90 days" },
};

export function isRecordExpired(createdAt: string | Date, category: RetentionCategory): boolean {
  const policy = RETENTION_POLICIES[category];
  if (!policy) return false;

  const recordDate = new Date(createdAt).getTime();
  const cutoffDate = Date.now() - policy.retentionDays * 24 * 60 * 60 * 1000;
  return recordDate < cutoffDate;
}

export function getRetentionCutoffDate(category: RetentionCategory): Date {
  const policy = RETENTION_POLICIES[category];
  const days = policy ? policy.retentionDays : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
