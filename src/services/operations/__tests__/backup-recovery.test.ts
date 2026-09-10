/**
 * ============================================================================
 * Splinci Commerce OS — CI-008 Backup Recovery Test Suite
 * ============================================================================
 * Specification Reference: CI-008 / TEST-008 / BACKUP-001 / ENG-001
 * Coverage: BackupRecoveryPolicy, BackupRecoveryService, RPO/RTO & DR Certification
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { BackupRecoveryPolicy } from "../backup-recovery.policy";
import { BackupRecoveryService } from "../backup-recovery.service";
import {
  RestoreExerciseStatusEnum,
  DRCertificationStatusEnum,
} from "../../../types/operations-backup.dto";

describe("CI-008 Enterprise Backup Recovery Test Suite", () => {
  const companyA = "cmp_ci_tenant_a";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "CI_BACKUP_TENANT", legalName: "CI Backup Legal", displayName: "CI Backup Tenant" },
      update: {},
    });
  });

  describe("1. BackupRecoveryPolicy Rules", () => {
    it("should calculate RPO evidence accurately", () => {
      const now = new Date().toISOString();
      const twoMinsAgo = new Date(Date.now() - 120000).toISOString();
      const rpo = BackupRecoveryPolicy.calculateRPO(now, twoMinsAgo);

      expect(rpo.targetMinutes).toBe(5);
      expect(rpo.measuredMinutes).toBe(2);
      expect(rpo.isPassed).toBe(true);
      expect(rpo.status).toBe(RestoreExerciseStatusEnum.VALIDATION_PASSED);
    });

    it("should calculate RTO evidence accurately", () => {
      const start = new Date(Date.now() - 180000).toISOString();
      const finish = new Date().toISOString();
      const rto = BackupRecoveryPolicy.calculateRTO(start, finish);

      expect(rto.targetMinutes).toBe(15);
      expect(rto.measuredMinutes).toBe(3);
      expect(rto.isPassed).toBe(true);
    });

    it("should reject DR_VERIFIED certification without physical restore evidence", () => {
      const cert = BackupRecoveryPolicy.evaluateDRCertification({
        isPhysicalRestoreExecuted: false,
        integrityPassed: true,
        rpoPassed: true,
        rtoPassed: true,
      });

      expect(cert.certificationStatus).toBe(DRCertificationStatusEnum.OPERATIONALLY_READY);
      expect(cert.isDRVerified).toBe(false);
      expect(cert.blockingReasons.length).toBeGreaterThan(0);
    });

    it("should grant DR_VERIFIED certification when physical restore evidence passes all gates", () => {
      const cert = BackupRecoveryPolicy.evaluateDRCertification({
        isPhysicalRestoreExecuted: true,
        integrityPassed: true,
        rpoPassed: true,
        rtoPassed: true,
      });

      expect(cert.certificationStatus).toBe(DRCertificationStatusEnum.DR_VERIFIED);
      expect(cert.isDRVerified).toBe(true);
      expect(cert.blockingReasons.length).toBe(0);
    });
  });

  describe("2. BackupRecoveryService Execution", () => {
    let service: BackupRecoveryService;

    beforeEach(() => {
      service = new BackupRecoveryService();
    });

    it("should discover available PostgreSQL backups", async () => {
      const backups = await service.discoverAvailableBackups(companyA);
      expect(backups.length).toBeGreaterThan(0);
      expect(backups[0].isPITRAvailable).toBe(true);
    });

    it("should reject restore targeting production database", async () => {
      await expect(
        service.executeStagingRestore({
          environment: "staging",
          restoreTarget: "production_db_replica",
        }, companyA)
      ).rejects.toThrow("SAFETY VIOLATION");
    });

    it("should execute staging restore drill and upgrade certification to DR_VERIFIED", async () => {
      const initialCert = await service.getCertificationStatus(companyA);
      expect(initialCert.certificationStatus).toBe(DRCertificationStatusEnum.OPERATIONALLY_READY);

      const result = await service.executeStagingRestore({
        environment: "staging",
        restoreTarget: "staging_isolated_drill_db",
      }, companyA, null as any);

      expect(result.status).toBe(RestoreExerciseStatusEnum.VALIDATION_PASSED);
      expect(result.certificationLevel).toBe(DRCertificationStatusEnum.DR_VERIFIED);

      const upgradedCert = await service.getCertificationStatus(companyA);
      expect(upgradedCert.certificationStatus).toBe(DRCertificationStatusEnum.DR_VERIFIED);
      expect(upgradedCert.isDRVerified).toBe(true);
    });

    it("should assemble complete backup recovery dashboard DTO", async () => {
      const dashboard = await service.getBackupRecoveryDashboard(companyA);
      expect(dashboard.evaluatedAt).toBeDefined();
      expect(dashboard.availableBackups.length).toBeGreaterThan(0);
      expect(dashboard.rpoEvidence.isPassed).toBe(true);
    });
  });
});
