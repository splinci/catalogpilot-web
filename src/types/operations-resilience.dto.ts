/**
 * ============================================================================
 * Splinci Commerce OS — Production Resilience & DR Data Contracts & DTOs
 * ============================================================================
 * Specification Reference: CI-006 / DTO-001 / RESILIENCE-001 / ENG-001
 * Strongly Typed Zod Schemas & Interfaces for Resilience & Disaster Recovery Intelligence
 * ============================================================================
 */

import { z } from "zod";

export enum ResilienceRatingEnum {
  EXCELLENT = "EXCELLENT",
  STRONG = "STRONG",
  DEGRADED = "DEGRADED",
  CRITICAL = "CRITICAL",
}

export enum DependencyStatusEnum {
  HEALTHY = "HEALTHY",
  DEGRADED = "DEGRADED",
  FAILED = "FAILED",
  UNKNOWN = "UNKNOWN",
}

export enum RTOStatusEnum {
  MEASURED = "MEASURED",
  ESTIMATED = "ESTIMATED",
  DEGRADED = "DEGRADED",
  UNKNOWN = "UNKNOWN",
}

export enum RPOStatusEnum {
  VERIFIED = "VERIFIED",
  ESTIMATED = "ESTIMATED",
  BACKUP_VERIFICATION_REQUIRED = "BACKUP_VERIFICATION_REQUIRED",
  UNKNOWN = "UNKNOWN",
}

export const RecoveryReadinessSchema = z.object({
  score: z.number().min(0).max(100),
  rating: z.nativeEnum(ResilienceRatingEnum),
  passedChecksCount: z.number(),
  warningsCount: z.number(),
  criticalBlockersCount: z.number(),
  evidence: z.array(z.string()),
});

export type RecoveryReadinessDto = z.infer<typeof RecoveryReadinessSchema>;

export const RTOAssessmentSchema = z.object({
  targetMinutes: z.number(),
  estimatedRecoveryMinutes: z.number(),
  worstObservedMinutes: z.number(),
  rtoStatus: z.nativeEnum(RTOStatusEnum),
  riskLevel: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
  evidence: z.string(),
});

export type RTOAssessmentDto = z.infer<typeof RTOAssessmentSchema>;

export const RPOAssessmentSchema = z.object({
  targetMinutes: z.number(),
  estimatedDataLossMinutes: z.number(),
  outboxPersistenceState: z.string(),
  rpoStatus: z.nativeEnum(RPOStatusEnum),
  riskLevel: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
  evidence: z.string(),
});

export type RPOAssessmentDto = z.infer<typeof RPOAssessmentSchema>;

export const DependencyHealthSchema = z.object({
  name: z.string(),
  type: z.enum(["DATABASE", "QUEUE", "WORKER", "ALERTING", "RUNTIME"]),
  status: z.nativeEnum(DependencyStatusEnum),
  latencyMs: z.number().optional(),
  details: z.string(),
});

export type DependencyHealthDto = z.infer<typeof DependencyHealthSchema>;

export const FailureDomainSchema = z.object({
  domain: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["HEALTHY", "DEGRADED", "FAILED"]),
  detectionCapability: z.string(),
  recoveryCapability: z.string(),
  recommendedAction: z.string(),
});

export type FailureDomainDto = z.infer<typeof FailureDomainSchema>;

export const RecoveryRecommendationSchema = z.object({
  id: z.string(),
  priority: z.enum(["P1", "P2", "P3", "P4"]),
  recommendation: z.string(),
  riskReduction: z.string(),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
  evidence: z.string(),
});

export type RecoveryRecommendationDto = z.infer<typeof RecoveryRecommendationSchema>;

export const DRExerciseReadinessSchema = z.object({
  score: z.number().min(0).max(100),
  readinessRating: z.nativeEnum(ResilienceRatingEnum),
  runbookExists: z.boolean(),
  healthEndpointExists: z.boolean(),
  missingPrerequisites: z.array(z.string()),
  recommendedExerciseType: z.string(),
});

export type DRExerciseReadinessDto = z.infer<typeof DRExerciseReadinessSchema>;

export const ResilienceDashboardSchema = z.object({
  evaluatedAt: z.string(),
  companyId: z.string().optional(),
  readiness: RecoveryReadinessSchema,
  rto: RTOAssessmentSchema,
  rpo: RPOAssessmentSchema,
  dependencies: z.array(DependencyHealthSchema),
  failureDomains: z.array(FailureDomainSchema),
  recommendations: z.array(RecoveryRecommendationSchema),
  drReadiness: DRExerciseReadinessSchema,
});

export type ResilienceDashboardDto = z.infer<typeof ResilienceDashboardSchema>;
