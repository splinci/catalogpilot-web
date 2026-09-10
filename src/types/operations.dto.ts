/**
 * ============================================================================
 * Splinci Commerce OS — Operations & Production Readiness DTO Schemas
 * ============================================================================
 * Specification Reference: M12-001 / OPS-001 / DAT-001 / NFR-001
 * Domain: Operations & Production Readiness Data Transfer Objects & Schemas
 * ============================================================================
 */

import { z } from "zod";

// ==========================================
// 1. OPERATIONAL ENUMS & CONSTANTS
// ==========================================

export enum SystemHealthStatusEnum {
  HEALTHY = "HEALTHY",
  DEGRADED = "DEGRADED",
  UNHEALTHY = "UNHEALTHY",
}

export enum IncidentSeverityEnum {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum IncidentSourceEnum {
  OUTBOX = "OUTBOX",
  AI_JOB = "AI_JOB",
  WORKFLOW = "WORKFLOW",
  SECURITY_AUDIT = "SECURITY_AUDIT",
}

export enum OutboxStatusEnum {
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

// ==========================================
// 2. HEALTH & SYSTEM DIAGNOSTIC SCHEMAS
// ==========================================

export const HealthCheckQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type HealthCheckQueryDto = z.infer<typeof HealthCheckQuerySchema>;

export const HealthCheckRecordSchema = z.object({
  id: z.string(),
  status: z.string(),
  checkedAt: z.date(),
  latencyMs: z.number().optional(),
});

export type HealthCheckRecordDto = z.infer<typeof HealthCheckRecordSchema>;

export const SystemHealthTelemetrySchema = z.object({
  status: z.nativeEnum(SystemHealthStatusEnum),
  version: z.string(),
  timestamp: z.string(),
  uptimeSeconds: z.number(),
  database: z.object({
    status: z.string(),
    latencyMs: z.number(),
    provider: z.string(),
  }),
  system: z.object({
    memoryHeapUsedMB: z.string(),
    memoryRssMB: z.string(),
    nodeVersion: z.string(),
  }),
  security: z.object({
    sqlInjectionProtected: z.boolean(),
    xssAutoEscaping: z.boolean(),
    multiTenantIsolated: z.boolean(),
    rateLimitingActive: z.boolean(),
  }),
});

export type SystemHealthTelemetryDto = z.infer<typeof SystemHealthTelemetrySchema>;

// ==========================================
// 3. OUTBOX QUEUE MONITORING SCHEMAS
// ==========================================

export const OutboxQuerySchema = z.object({
  companyId: z.string().min(1),
  status: z.nativeEnum(OutboxStatusEnum).optional(),
  eventType: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type OutboxQueryDto = z.infer<typeof OutboxQuerySchema>;

export const OutboxRetryPayloadSchema = z.object({
  companyId: z.string().min(1),
  outboxId: z.string().min(1),
  reason: z.string().optional(),
});

export type OutboxRetryPayloadDto = z.infer<typeof OutboxRetryPayloadSchema>;

// ==========================================
// 4. OPERATIONAL INCIDENTS SCHEMAS
// ==========================================

export const IncidentQuerySchema = z.object({
  companyId: z.string().min(1),
  source: z.nativeEnum(IncidentSourceEnum).optional(),
  severity: z.nativeEnum(IncidentSeverityEnum).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type IncidentQueryDto = z.infer<typeof IncidentQuerySchema>;

export const IncidentItemSchema = z.object({
  id: z.string(),
  source: z.nativeEnum(IncidentSourceEnum),
  severity: z.nativeEnum(IncidentSeverityEnum),
  title: z.string(),
  details: z.string(),
  entityId: z.string().optional(),
  occurredAt: z.date(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type IncidentItemDto = z.infer<typeof IncidentItemSchema>;

// ==========================================
// 5. OPERATIONAL METRICS SCHEMAS
// ==========================================

export const OperationsMetricsQuerySchema = z.object({
  companyId: z.string().min(1),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export type OperationsMetricsQueryDto = z.infer<typeof OperationsMetricsQuerySchema>;

export const OperationsMetricsSummarySchema = z.object({
  companyId: z.string(),
  outbox: z.object({
    totalMessages: z.number(),
    pendingCount: z.number(),
    processedCount: z.number(),
    failedCount: z.number(),
    avgRetryCount: z.number(),
  }),
  aiJobs: z.object({
    totalJobs: z.number(),
    completedCount: z.number(),
    processingCount: z.number(),
    failedCount: z.number(),
  }),
  workflows: z.object({
    totalExecutions: z.number(),
    pendingCount: z.number(),
    approvedCount: z.number(),
    rejectedCount: z.number(),
    expiredCount: z.number(),
  }),
  securityAudit: z.object({
    totalLogs: z.number(),
    failedLogins: z.number(),
    activeUserSessions: z.number(),
  }),
  alerts: z.object({
    unreadCount: z.number(),
    totalCount: z.number(),
  }),
});

export type OperationsMetricsSummaryDto = z.infer<typeof OperationsMetricsSummarySchema>;

// ==========================================
// 6. SYSTEM SETTINGS SCHEMAS
// ==========================================

export const UpsertSystemSettingSchema = z.object({
  companyId: z.string().min(1),
  key: z.string().min(1).max(100),
  value: z.string(),
});

export type UpsertSystemSettingDto = z.infer<typeof UpsertSystemSettingSchema>;

export const SystemSettingQuerySchema = z.object({
  companyId: z.string().min(1),
  key: z.string().optional(),
});

export type SystemSettingQueryDto = z.infer<typeof SystemSettingQuerySchema>;

// ==========================================
// 7. OPERATIONAL NOTIFICATIONS / ALERTS SCHEMAS
// ==========================================

export const CreateNotificationSchema = z.object({
  companyId: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
});

export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;

export const NotificationQuerySchema = z.object({
  companyId: z.string().min(1),
  userId: z.string().min(1),
  isRead: z.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export type NotificationQueryDto = z.infer<typeof NotificationQuerySchema>;
