/**
 * ============================================================================
 * Splinci Commerce OS — Production Validation & DR Certification Data Contracts
 * ============================================================================
 * Specification Reference: CI-007 / DTO-001 / VALIDATION-001 / ENG-001
 * Strongly Typed Zod Schemas & Interfaces for DR Exercise & Operational Validation
 * ============================================================================
 */

import { z } from "zod";

export enum ValidationStatusEnum {
  NOT_STARTED = "NOT_STARTED",
  CONFIGURED = "CONFIGURED",
  SIMULATED = "SIMULATED",
  EXERCISED = "EXERCISED",
  VERIFIED = "VERIFIED",
  CERTIFIED = "CERTIFIED",
  FAILED = "FAILED",
  UNKNOWN = "UNKNOWN",
  NOT_VERIFIED = "NOT_VERIFIED",
  BACKUP_VERIFICATION_REQUIRED = "BACKUP_VERIFICATION_REQUIRED",
}

export enum OperationalCertificationLevelEnum {
  NOT_READY = "NOT_READY",
  PARTIALLY_READY = "PARTIALLY_READY",
  OPERATIONALLY_READY = "OPERATIONALLY_READY",
  DR_VERIFIED = "DR_VERIFIED",
  PRODUCTION_CERTIFIED = "PRODUCTION_CERTIFIED",
}

export const ValidationScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["APP", "WORKER", "REDIS", "OUTBOX", "ALERTING", "DATABASE", "INCIDENT"]),
  environment: z.enum(["STAGING", "SIMULATION", "DRY_RUN", "PRODUCTION"]),
  status: z.nativeEnum(ValidationStatusEnum),
  measuredRTOMinutes: z.number().optional(),
  measuredRPOMinutes: z.number().optional(),
  evidence: z.string(),
  lastExercisedAt: z.string().optional(),
});

export type ValidationScenarioDto = z.infer<typeof ValidationScenarioSchema>;

export const ValidationEvidenceSchema = z.object({
  validationId: z.string(),
  scenarioId: z.string(),
  environment: z.string(),
  startedAt: z.string(),
  completedAt: z.string(),
  durationMs: z.number(),
  status: z.nativeEnum(ValidationStatusEnum),
  expectedResult: z.string(),
  actualResult: z.string(),
  evidence: z.string(),
  operator: z.string(),
  correlationId: z.string(),
});

export type ValidationEvidenceDto = z.infer<typeof ValidationEvidenceSchema>;

export const RTOValidationSchema = z.object({
  targetMinutes: z.number(),
  measuredMinutes: z.number(),
  varianceMinutes: z.number(),
  isPassed: z.boolean(),
  status: z.nativeEnum(ValidationStatusEnum),
  evidence: z.string(),
});

export type RTOValidationDto = z.infer<typeof RTOValidationSchema>;

export const RPOValidationSchema = z.object({
  targetMinutes: z.number(),
  measuredMinutes: z.number(),
  varianceMinutes: z.number(),
  isPassed: z.boolean(),
  status: z.nativeEnum(ValidationStatusEnum),
  evidence: z.string(),
});

export type RPOValidationDto = z.infer<typeof RPOValidationSchema>;

export const OperationalReadinessCertificationSchema = z.object({
  score: z.number().min(0).max(100),
  level: z.nativeEnum(OperationalCertificationLevelEnum),
  verifiedControlsCount: z.number(),
  unverifiedControlsCount: z.number(),
  blockersCount: z.number(),
  isDRVerified: z.boolean(),
  isProductionCertified: z.boolean(),
  certificationMessage: z.string(),
  evaluatedAt: z.string(),
});

export type OperationalReadinessCertificationDto = z.infer<typeof OperationalReadinessCertificationSchema>;

export const ValidationDashboardSchema = z.object({
  evaluatedAt: z.string(),
  companyId: z.string().optional(),
  certification: OperationalReadinessCertificationSchema,
  scenarios: z.array(ValidationScenarioSchema),
  rtoValidation: RTOValidationSchema,
  rpoValidation: RPOValidationSchema,
  recentEvidence: z.array(ValidationEvidenceSchema),
});

export type ValidationDashboardDto = z.infer<typeof ValidationDashboardSchema>;
