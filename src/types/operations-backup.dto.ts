/**
 * ============================================================================
 * Splinci Commerce OS — Backup & PITR Recovery Data Contracts & DTOs
 * ============================================================================
 * Specification Reference: CI-008 / DTO-001 / BACKUP-001 / ENG-001
 * Strongly Typed Zod Schemas & Interfaces for Backup/PITR Restore Verification
 * ============================================================================
 */

import { z } from "zod";

export enum RestoreExerciseStatusEnum {
  DISCOVERED = "DISCOVERED",
  VERIFIED = "VERIFIED",
  RESTORE_STARTED = "RESTORE_STARTED",
  RESTORE_COMPLETED = "RESTORE_COMPLETED",
  VALIDATION_PASSED = "VALIDATION_PASSED",
  BACKUP_VERIFICATION_REQUIRED = "BACKUP_VERIFICATION_REQUIRED",
  RESTORE_FAILED = "RESTORE_FAILED",
  RPO_FAILED = "RPO_FAILED",
  RTO_FAILED = "RTO_FAILED",
  DR_VERIFIED = "DR_VERIFIED",
}

export enum DRCertificationStatusEnum {
  OPERATIONALLY_READY = "OPERATIONALLY_READY",
  DR_VERIFIED = "DR_VERIFIED",
}

export const BackupMetadataSchema = z.object({
  id: z.string(),
  provider: z.string(),
  backupType: z.enum(["DAILY_SNAPSHOT", "CONTINUOUS_WAL", "PRE_DEPLOYMENT"]),
  createdAt: z.string(),
  sizeBytes: z.number().optional(),
  retentionDays: z.number(),
  isPITRAvailable: z.boolean(),
  status: z.enum(["AVAILABLE", "ARCHIVED", "CORRUPTED", "UNKNOWN"]),
});

export type BackupMetadataDto = z.infer<typeof BackupMetadataSchema>;

export const RestoreExerciseRequestSchema = z.object({
  environment: z.enum(["staging", "isolated_drill", "dry_run"]),
  restoreTarget: z.string().refine((val) => !val.includes("production"), {
    message: "Restore target cannot be production environment",
  }),
  backupId: z.string().optional(),
  targetTimestamp: z.string().optional(),
});

export type RestoreExerciseRequestDto = z.infer<typeof RestoreExerciseRequestSchema>;

export const RPOEvidenceSchema = z.object({
  targetMinutes: z.number(),
  measuredMinutes: z.number().optional(),
  eventReferenceTimestamp: z.string(),
  latestRecoverableTimestamp: z.string(),
  isPassed: z.boolean(),
  status: z.nativeEnum(RestoreExerciseStatusEnum),
  evidence: z.string(),
});

export type RPOEvidenceDto = z.infer<typeof RPOEvidenceSchema>;

export const RTOEvidenceSchema = z.object({
  targetMinutes: z.number(),
  measuredMinutes: z.number().optional(),
  exerciseStartedAt: z.string(),
  restoreCompletedAt: z.string().optional(),
  isPassed: z.boolean(),
  status: z.nativeEnum(RestoreExerciseStatusEnum),
  evidence: z.string(),
});

export type RTOEvidenceDto = z.infer<typeof RTOEvidenceSchema>;

export const BackupIntegrityResultSchema = z.object({
  dbConnected: z.boolean(),
  prismaConnected: z.boolean(),
  schemaCompatible: z.boolean(),
  recordCounts: z.record(z.string(), z.number()),
  foreignKeysValid: z.boolean(),
  passed: z.boolean(),
  details: z.string(),
});

export type BackupIntegrityResultDto = z.infer<typeof BackupIntegrityResultSchema>;

export const RestoreExerciseResultSchema = z.object({
  exerciseId: z.string(),
  environment: z.string(),
  restoreTarget: z.string(),
  status: z.nativeEnum(RestoreExerciseStatusEnum),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  rpo: RPOEvidenceSchema,
  rto: RTOEvidenceSchema,
  integrity: BackupIntegrityResultSchema,
  certificationLevel: z.nativeEnum(DRCertificationStatusEnum),
  failureReason: z.string().optional(),
  operator: z.string(),
});

export type RestoreExerciseResultDto = z.infer<typeof RestoreExerciseResultSchema>;

export const BackupRecoveryDashboardSchema = z.object({
  evaluatedAt: z.string(),
  companyId: z.string().optional(),
  certificationStatus: z.nativeEnum(DRCertificationStatusEnum),
  isDRVerified: z.boolean(),
  availableBackups: z.array(BackupMetadataSchema),
  rpoEvidence: RPOEvidenceSchema,
  rtoEvidence: RTOEvidenceSchema,
  latestExerciseResult: RestoreExerciseResultSchema.optional(),
  blockingReasons: z.array(z.string()),
});

export type BackupRecoveryDashboardDto = z.infer<typeof BackupRecoveryDashboardSchema>;
