/**
 * ============================================================================
 * Splinci Commerce OS — Alert Data Contracts & DTOs
 * ============================================================================
 * Specification Reference: CI-003 / DTO-001 / ALERT-001 / SEC-001
 * Strongly Typed Zod Schemas & Interfaces for Operational Incident Alerting
 * ============================================================================
 */

import { z } from "zod";

export enum AlertSeverityEnum {
  P1_CRITICAL = "P1_CRITICAL",
  P2_HIGH = "P2_HIGH",
  P3_MEDIUM = "P3_MEDIUM",
  P4_LOW = "P4_LOW",
}

export enum AlertSourceEnum {
  DATABASE = "DATABASE",
  SECURITY = "SECURITY",
  OUTBOX = "OUTBOX",
  WORKER = "WORKER",
  SLO_BREACH = "SLO_BREACH",
  INCIDENT = "INCIDENT",
  AI_JOB = "AI_JOB",
  WORKFLOW = "WORKFLOW",
}

export enum AlertStatusEnum {
  DISPATCHED = "DISPATCHED",
  SUPPRESSED = "SUPPRESSED",
  FAILED = "FAILED",
  RECOVERED = "RECOVERED",
}

export enum NotificationChannelEnum {
  SLACK_WEBHOOK = "SLACK_WEBHOOK",
  GENERIC_WEBHOOK = "GENERIC_WEBHOOK",
}

export const AlertEventSchema = z.object({
  alertId: z.string().optional(),
  severity: z.nativeEnum(AlertSeverityEnum),
  source: z.nativeEnum(AlertSourceEnum),
  eventType: z.string().min(1),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  occurredAt: z.string().datetime().optional(),
  companyId: z.string().optional(), // Nullable for platform-scoped alerts
  deduplicationKey: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type AlertEventDto = z.infer<typeof AlertEventSchema>;

export const AlertDeliveryResultSchema = z.object({
  alertId: z.string(),
  channel: z.nativeEnum(NotificationChannelEnum),
  status: z.nativeEnum(AlertStatusEnum),
  dispatchedAt: z.string(),
  deduplicated: z.boolean(),
  error: z.string().optional(),
});

export type AlertDeliveryResultDto = z.infer<typeof AlertDeliveryResultSchema>;
