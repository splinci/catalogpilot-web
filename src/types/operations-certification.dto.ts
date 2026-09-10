/**
 * ============================================================================
 * Splinci Commerce OS — Production Certification Data Contracts & DTOs
 * ============================================================================
 * Specification Reference: CI-009 / DTO-001 / CERTIFICATION-001 / ENG-001
 * Strongly Typed Zod Schemas & Interfaces for Final Production Certification
 * ============================================================================
 */

import { z } from "zod";

export enum CertificationLevelEnum {
  NOT_READY = "NOT_READY",
  CONDITIONALLY_READY = "CONDITIONALLY_READY",
  GO_LIVE_READY = "GO_LIVE_READY",
  PRODUCTION_CERTIFIED = "PRODUCTION_CERTIFIED",
}

export enum GateStatusEnum {
  PASS = "PASS",
  FAIL = "FAIL",
  WARNING = "WARNING",
  NOT_VERIFIED = "NOT_VERIFIED",
}

export const CertificationGateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  isCritical: z.boolean(),
  status: z.nativeEnum(GateStatusEnum),
  evidence: z.string(),
  remediation: z.string().optional(),
});

export type CertificationGateDto = z.infer<typeof CertificationGateSchema>;

export const GoLiveReadinessScoreSchema = z.object({
  totalScore: z.number().min(0).max(100),
  level: z.nativeEnum(CertificationLevelEnum),
  categoryScores: z.record(z.string(), z.number()),
  passedGatesCount: z.number(),
  failedCriticalGatesCount: z.number(),
  warningGatesCount: z.number(),
  unverifiedGatesCount: z.number(),
});

export type GoLiveReadinessScoreDto = z.infer<typeof GoLiveReadinessScoreSchema>;

export const ProductionConfigValidationSchema = z.object({
  databaseUrl: z.enum(["CONFIGURED", "MISSING", "INVALID"]),
  nodeEnv: z.enum(["CONFIGURED", "MISSING", "INVALID"]),
  authSecret: z.enum(["CONFIGURED", "MISSING", "INVALID"]),
  outboxWorker: z.enum(["CONFIGURED", "MISSING", "INVALID"]),
  alertingWebhook: z.enum(["CONFIGURED", "MISSING", "INVALID"]),
  overallConfigStatus: z.enum(["CONFIGURED", "MISSING", "INVALID"]),
});

export type ProductionConfigValidationDto = z.infer<typeof ProductionConfigValidationSchema>;

export const SecurityCertificationSchema = z.object({
  authenticationVerified: z.boolean(),
  rbacEnforced: z.boolean(),
  tenantIsolationEnforced: z.boolean(),
  zeroUiPrismaDirectAccess: z.boolean(),
  zeroApiRepositoryBypass: z.boolean(),
  secretProtectionVerified: z.boolean(),
  auditLoggingVerified: z.boolean(),
  status: z.nativeEnum(GateStatusEnum),
});

export type SecurityCertificationDto = z.infer<typeof SecurityCertificationSchema>;

export const DRCertificationSummarySchema = z.object({
  isDRVerified: z.boolean(),
  measuredRPO: z.number(),
  targetRPO: z.number(),
  measuredRTO: z.number(),
  targetRTO: z.number(),
  postRestoreIntegrity: z.boolean(),
  evidenceId: z.string(),
});

export type DRCertificationSummaryDto = z.infer<typeof DRCertificationSummarySchema>;

export const CertificationSignOffRequestSchema = z.object({
  signOffRole: z.string(),
  comments: z.string().min(5),
  confirmGoLiveReady: z.boolean(),
});

export type CertificationSignOffRequestDto = z.infer<typeof CertificationSignOffRequestSchema>;

export const CertificationDashboardSchema = z.object({
  evaluatedAt: z.string(),
  companyId: z.string().optional(),
  certificationLevel: z.nativeEnum(CertificationLevelEnum),
  readinessScore: GoLiveReadinessScoreSchema,
  gates: z.array(CertificationGateSchema),
  security: SecurityCertificationSchema,
  drSummary: DRCertificationSummarySchema,
  configValidation: ProductionConfigValidationSchema,
  signOffCompleted: z.boolean(),
  signOffBy: z.string().optional(),
  signOffAt: z.string().optional(),
});

export type CertificationDashboardDto = z.infer<typeof CertificationDashboardSchema>;
