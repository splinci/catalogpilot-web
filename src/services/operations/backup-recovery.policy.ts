/**
 * ============================================================================
 * Splinci Commerce OS — Backup & PITR Recovery Policy Engine
 * ============================================================================
 * Specification Reference: CI-008 / BACKUP-001 / POL-001 / ENG-001
 * Domain: Pure Backup Integrity, RPO/RTO Evaluation & DR Certification Rules
 * Note: Pure functions ONLY — 0 Prisma imports, 0 database queries.
 * ============================================================================
 */

import {
  RestoreExerciseStatusEnum,
  DRCertificationStatusEnum,
  RPOEvidenceDto,
  RTOEvidenceDto,
  BackupIntegrityResultDto,
} from "../../types/operations-backup.dto";

export class BackupRecoveryPolicy {
  /**
   * Evaluate RPO Evidence based on event and recoverable timestamps.
   */
  static calculateRPO(eventTimestampISO: string, latestRecoverableISO: string): RPOEvidenceDto {
    const targetMinutes = 5;
    const eventTime = new Date(eventTimestampISO).getTime();
    const recoverableTime = new Date(latestRecoverableISO).getTime();

    const diffMs = Math.max(0, eventTime - recoverableTime);
    const measuredMinutes = Math.round((diffMs / 60000) * 10) / 10;
    const isPassed = measuredMinutes <= targetMinutes;

    return {
      targetMinutes,
      measuredMinutes,
      eventReferenceTimestamp: eventTimestampISO,
      latestRecoverableTimestamp: latestRecoverableISO,
      isPassed,
      status: isPassed ? RestoreExerciseStatusEnum.VALIDATION_PASSED : RestoreExerciseStatusEnum.RPO_FAILED,
      evidence: `Measured RPO of ${measuredMinutes} mins compared against target of ${targetMinutes} mins`,
    };
  }

  /**
   * Evaluate RTO Evidence based on exercise lifecycle timestamps.
   */
  static calculateRTO(exerciseStartedISO: string, restoreCompletedISO?: string): RTOEvidenceDto {
    const targetMinutes = 15;

    if (!restoreCompletedISO) {
      return {
        targetMinutes,
        exerciseStartedAt: exerciseStartedISO,
        isPassed: false,
        status: RestoreExerciseStatusEnum.BACKUP_VERIFICATION_REQUIRED,
        evidence: "Physical database restore drill has not been executed; RTO remains unmeasured",
      };
    }

    const startedTime = new Date(exerciseStartedISO).getTime();
    const completedTime = new Date(restoreCompletedISO).getTime();
    const measuredMinutes = Math.round(((completedTime - startedTime) / 60000) * 10) / 10;
    const isPassed = measuredMinutes <= targetMinutes;

    return {
      targetMinutes,
      measuredMinutes,
      exerciseStartedAt: exerciseStartedISO,
      restoreCompletedAt: restoreCompletedISO,
      isPassed,
      status: isPassed ? RestoreExerciseStatusEnum.VALIDATION_PASSED : RestoreExerciseStatusEnum.RTO_FAILED,
      evidence: `Measured restore RTO of ${measuredMinutes} mins compared against target RTO of ${targetMinutes} mins`,
    };
  }

  /**
   * Validate Post-Restore Database Integrity.
   */
  static validateIntegrity(params: {
    dbConnected: boolean;
    prismaConnected: boolean;
    schemaCompatible: boolean;
    foreignKeysValid: boolean;
    recordCounts: Record<string, number>;
  }): BackupIntegrityResultDto {
    const passed = params.dbConnected && params.prismaConnected && params.schemaCompatible && params.foreignKeysValid;

    return {
      dbConnected: params.dbConnected,
      prismaConnected: params.prismaConnected,
      schemaCompatible: params.schemaCompatible,
      foreignKeysValid: params.foreignKeysValid,
      recordCounts: params.recordCounts,
      passed,
      details: passed
        ? "Post-restore database connectivity, Prisma ORM mapping, schema compatibility, and foreign keys verified"
        : "Database post-restore integrity check failed; inspect logs",
    };
  }

  /**
   * Determine DR Certification Eligibility.
   * CRITICAL GOVERNANCE RULE: DR_VERIFIED requires physical restore evidence!
   */
  static evaluateDRCertification(params: {
    isPhysicalRestoreExecuted: boolean;
    integrityPassed: boolean;
    rpoPassed: boolean;
    rtoPassed: boolean;
  }): { certificationStatus: DRCertificationStatusEnum; isDRVerified: boolean; blockingReasons: string[] } {
    const blockingReasons: string[] = [];

    if (!params.isPhysicalRestoreExecuted) {
      blockingReasons.push("Physical staging PostgreSQL snapshot/PITR restore has not been executed");
    }
    if (!params.integrityPassed) {
      blockingReasons.push("Post-restore database schema & foreign key integrity verification pending");
    }
    if (!params.rpoPassed) {
      blockingReasons.push("Measured RPO target (<= 5 mins) unverified");
    }
    if (!params.rtoPassed) {
      blockingReasons.push("Measured RTO target (<= 15 mins) unverified");
    }

    const isDRVerified = blockingReasons.length === 0;

    return {
      certificationStatus: isDRVerified ? DRCertificationStatusEnum.DR_VERIFIED : DRCertificationStatusEnum.OPERATIONALLY_READY,
      isDRVerified,
      blockingReasons,
    };
  }
}
