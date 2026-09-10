/**
 * ============================================================================
 * Splinci Commerce OS — Production Go-Live & Stabilization Data Contracts
 * ============================================================================
 * Specification Reference: GO-001 / DTO-001 / GOLIVE-001 / ENG-001
 * Strongly Typed Zod Schemas & Interfaces for Controlled Production Launch
 * Note: Secrets must NEVER be present in returned DTOs.
 * ============================================================================
 */

import { z } from "zod";

export enum GoLiveStatusEnum {
  PRE_FLIGHT = "PRE_FLIGHT",
  CONTROLLED_LAUNCH = "CONTROLLED_LAUNCH",
  OBSERVATION = "OBSERVATION",
  STABLE_PRODUCTION = "STABLE_PRODUCTION",
  BLOCKED = "BLOCKED",
}

export enum StabilizationStatusEnum {
  STABLE = "STABLE",
  STABLE_WITH_WARNINGS = "STABLE_WITH_WARNINGS",
  DEGRADED = "DEGRADED",
  INCIDENT_REVIEW_REQUIRED = "INCIDENT_REVIEW_REQUIRED",
}

export enum ConfigCheckStatusEnum {
  VALID = "VALID",
  INVALID = "INVALID",
  MISSING = "MISSING",
  WARNING = "WARNING",
}

export const ProductionConfigCheckSchema = z.object({
  key: z.string(),
  status: z.nativeEnum(ConfigCheckStatusEnum),
  isMandatory: z.boolean(),
  notes: z.string(),
});

export type ProductionConfigCheckDto = z.infer<typeof ProductionConfigCheckSchema>;

export const ProductionConfigValidationSchema = z.object({
  evaluatedAt: z.string(),
  overallStatus: z.nativeEnum(ConfigCheckStatusEnum),
  checks: z.array(ProductionConfigCheckSchema),
});

export type ProductionConfigValidationDto = z.infer<typeof ProductionConfigValidationSchema>;

export const PreflightCheckResultSchema = z.object({
  evaluatedAt: z.string(),
  status: z.nativeEnum(GoLiveStatusEnum),
  passedChecksCount: z.number(),
  failedChecksCount: z.number(),
  blockers: z.array(z.string()),
});

export type PreflightCheckResultDto = z.infer<typeof PreflightCheckResultSchema>;

export const ProductionSmokeTestResultSchema = z.object({
  executedAt: z.string(),
  isPassed: z.boolean(),
  appStatus: z.string(),
  dbStatus: z.string(),
  tenantIsolationStatus: z.string(),
  rbacStatus: z.string(),
  outboxStatus: z.string(),
  sloStatus: z.string(),
  alertingStatus: z.string(),
  drStatus: z.string(),
  operatorId: z.string(),
});

export type ProductionSmokeTestResultDto = z.infer<typeof ProductionSmokeTestResultSchema>;

export const ProductionBaselineSnapshotSchema = z.object({
  capturedAt: z.string(),
  version: z.string(),
  commitHash: z.string(),
  dbConnected: z.boolean(),
  queueDepth: z.number(),
  workerCount: z.number(),
  pendingOutbox: z.number(),
  failedOutbox: z.number(),
  sloStatus: z.string(),
  resilienceScore: z.number(),
  drVerified: z.boolean(),
});

export type ProductionBaselineSnapshotDto = z.infer<typeof ProductionBaselineSnapshotSchema>;

export const StabilizationSummarySchema = z.object({
  evaluatedAt: z.string(),
  window: z.enum(["24h", "7d"]),
  status: z.nativeEnum(StabilizationStatusEnum),
  availabilityPercent: z.number(),
  avgLatencyMs: z.number(),
  errorRatePercent: z.number(),
  totalIncidentsCount: z.number(),
  p1IncidentsCount: z.number(),
  unresolvedIssues: z.array(z.string()),
});

export type StabilizationSummaryDto = z.infer<typeof StabilizationSummarySchema>;

export const GoLiveGateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  isCritical: z.boolean(),
  status: z.enum(["PASS", "FAIL", "WARNING", "NOT_VERIFIED"]),
  evidence: z.string(),
});

export type GoLiveGateDto = z.infer<typeof GoLiveGateSchema>;

export const GoLiveDashboardSchema = z.object({
  evaluatedAt: z.string(),
  companyId: z.string().optional(),
  goLiveStatus: z.nativeEnum(GoLiveStatusEnum),
  certificationLevel: z.string(),
  configValidation: ProductionConfigValidationSchema,
  preflight: PreflightCheckResultSchema,
  latestSmokeTest: ProductionSmokeTestResultSchema.nullable(),
  baseline: ProductionBaselineSnapshotSchema.nullable(),
  stabilization24h: StabilizationSummarySchema,
  stabilization7d: StabilizationSummarySchema,
  gatesCount: z.number(),
  passedGatesCount: z.number(),
  gates: z.array(GoLiveGateSchema),
});

export type GoLiveDashboardDto = z.infer<typeof GoLiveDashboardSchema>;
