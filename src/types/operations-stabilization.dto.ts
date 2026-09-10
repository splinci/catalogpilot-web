/**
 * ============================================================================
 * Splinci Commerce OS — Production Stabilization Data Contracts & DTOs
 * ============================================================================
 * Specification Reference: GO-002 / DTO-001 / STABILIZATION-001 / ENG-001
 * Strongly Typed Zod Schemas & Interfaces for 24-Hour Production Stabilization
 * Note: Secrets must NEVER be present in returned DTOs.
 * ============================================================================
 */

import { z } from "zod";

export enum ProductionLaunchStatusEnum {
  PRE_LAUNCH = "PRE_LAUNCH",
  LAUNCHED = "LAUNCHED",
  OBSERVING = "OBSERVING",
  DEGRADED = "DEGRADED",
  INCIDENT = "INCIDENT",
  STABILIZED = "STABILIZED",
  ROLLBACK_RECOMMENDED = "ROLLBACK_RECOMMENDED",
  STABLE_PRODUCTION_PENDING = "STABLE_PRODUCTION_PENDING",
}

export enum ObservationCheckpointEnum {
  CHECKPOINT_0H = "CHECKPOINT_0H",
  CHECKPOINT_1H = "CHECKPOINT_1H",
  CHECKPOINT_6H = "CHECKPOINT_6H",
  CHECKPOINT_12H = "CHECKPOINT_12H",
  CHECKPOINT_24H = "CHECKPOINT_24H",
}

export enum StabilizationDecisionEnum {
  PASSED = "PASSED",
  DEGRADED = "DEGRADED",
  FAILED = "FAILED",
  REQUIRES_EXTENDED_OBSERVATION = "REQUIRES_EXTENDED_OBSERVATION",
}

export const LiveProductionHealthSchema = z.object({
  availabilityPercent: z.number(),
  avgLatencyMs: z.number(),
  errorRatePercent: z.number(),
  databaseStatus: z.string(),
  workerStatus: z.string(),
  queueDepth: z.number(),
  activeIncidentsCount: z.number(),
  p1IncidentsCount: z.number(),
  drVerified: z.boolean(),
});

export type LiveProductionHealthDto = z.infer<typeof LiveProductionHealthSchema>;

export const ProductionObservationSampleSchema = z.object({
  sampledAt: z.string(),
  checkpoint: z.nativeEnum(ObservationCheckpointEnum),
  health: LiveProductionHealthSchema,
  sloStatus: z.string(),
  resilienceScore: z.number(),
  alertsDelivered: z.number(),
});

export type ProductionObservationSampleDto = z.infer<typeof ProductionObservationSampleSchema>;

export const StabilizationMetricSchema = z.object({
  name: z.string(),
  currentValue: z.number(),
  targetThreshold: z.number(),
  unit: z.string(),
  isHealthy: z.boolean(),
});

export type StabilizationMetricDto = z.infer<typeof StabilizationMetricSchema>;

export const StabilizationIncidentSchema = z.object({
  id: z.string(),
  severity: z.enum(["P1", "P2", "P3", "P4"]),
  title: z.string(),
  startedAt: z.string(),
  resolvedAt: z.string().nullable(),
  isResolved: z.boolean(),
});

export type StabilizationIncidentDto = z.infer<typeof StabilizationIncidentSchema>;

export const StabilizationEvaluationSchema = z.object({
  evaluatedAt: z.string(),
  checkpoint: z.nativeEnum(ObservationCheckpointEnum),
  availabilityPassed: z.boolean(),
  latencyPassed: z.boolean(),
  errorRatePassed: z.boolean(),
  incidentsPassed: z.boolean(),
  outboxPassed: z.boolean(),
  sloPassed: z.boolean(),
  resiliencePassed: z.boolean(),
  drPassed: z.boolean(),
  overallDecision: z.nativeEnum(StabilizationDecisionEnum),
});

export type StabilizationEvaluationDto = z.infer<typeof StabilizationEvaluationSchema>;

export const GoLiveGate30EvidenceSchema = z.object({
  evaluatedAt: z.string(),
  launchTimestamp: z.string(),
  version: z.string(),
  commitHash: z.string(),
  observationStart: z.string(),
  observationEnd: z.string(),
  availabilityPercent: z.number(),
  avgLatencyMs: z.number(),
  errorRatePercent: z.number(),
  p1Count: z.number(),
  p2Count: z.number(),
  unresolvedCount: z.number(),
  sloCompliance: z.string(),
  outboxHealth: z.string(),
  workerHealth: z.string(),
  alertHealth: z.string(),
  resilienceScore: z.number(),
  drVerified: z.boolean(),
  rollbackReady: z.boolean(),
  evaluatorDecision: z.nativeEnum(StabilizationDecisionEnum),
  gate30Status: z.enum(["PASS", "FAIL", "NOT_VERIFIED"]),
  evidenceNotes: z.string(),
});

export type GoLiveGate30EvidenceDto = z.infer<typeof GoLiveGate30EvidenceSchema>;

export const StabilizationDashboardSchema = z.object({
  evaluatedAt: z.string(),
  companyId: z.string().optional(),
  launchStatus: z.nativeEnum(ProductionLaunchStatusEnum),
  currentHealth: LiveProductionHealthSchema,
  metrics: z.array(StabilizationMetricSchema),
  latestSample: ProductionObservationSampleSchema.nullable(),
  evaluation24h: StabilizationEvaluationSchema,
  gate30Evidence: GoLiveGate30EvidenceSchema,
  checkpoints: z.array(ProductionObservationSampleSchema),
});

export type StabilizationDashboardDto = z.infer<typeof StabilizationDashboardSchema>;
