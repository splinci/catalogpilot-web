/**
 * ============================================================================
 * Splinci Commerce OS — CI-009 Production Certification Test Suite
 * ============================================================================
 * Specification Reference: CI-009 / TEST-009 / CERTIFICATION-001 / ENG-001
 * Coverage: ProductionCertificationPolicy, ProductionCertificationService & Go-Live Readiness
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { prisma } from "../../../lib/prisma";
import { ProductionCertificationPolicy } from "../production-certification.policy";
import { ProductionCertificationService } from "../production-certification.service";
import { backupRecoveryService } from "../backup-recovery.service";
import { productionValidationService } from "../production-validation.service";
import { resilienceOperationsService } from "../resilience.service";
import {
  CertificationLevelEnum,
  GateStatusEnum,
} from "../../../types/operations-certification.dto";

describe("CI-009 Enterprise Production Certification Test Suite", () => {
  const companyA = "cmp_ci_tenant_a";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "CI_CERTIFICATION_TENANT", legalName: "CI Certification Legal", displayName: "CI Certification Tenant" },
      update: {},
    });
  });

  describe("1. ProductionCertificationPolicy Rules", () => {
    it("should evaluate all 26 mandatory certification gates correctly", () => {
      const gates = ProductionCertificationPolicy.evaluate26Gates({
        m1m12Frozen: true,
        ci001WorkerOk: true,
        ci002SloOk: true,
        ci003AlertOk: true,
        ci004TelemetryOk: true,
        ci005PredictiveOk: true,
        ci006ResilienceOk: true,
        ci007ValidationOk: true,
        ci008DrVerified: true,
        rpoOk: true,
        rtoOk: true,
        authOk: true,
        rbacOk: true,
        tenantIsolationOk: true,
        dbIntegrityOk: true,
        backupOk: true,
        observabilityOk: true,
        incidentResponseOk: true,
        capacityOk: true,
        configOk: true,
        deploymentOk: true,
        rollbackOk: true,
        testingOk: true,
        buildOk: true,
        regressionOk: true,
        securityProtectionOk: true,
        auditabilityOk: true,
      });

      expect(gates.length).toBe(26);
      expect(gates.every((g) => g.status === GateStatusEnum.PASS)).toBe(true);
    });

    it("should calculate 100-point weighted score and level GO_LIVE_READY when all gates pass", () => {
      const gates = ProductionCertificationPolicy.evaluate26Gates({
        m1m12Frozen: true,
        ci001WorkerOk: true,
        ci002SloOk: true,
        ci003AlertOk: true,
        ci004TelemetryOk: true,
        ci005PredictiveOk: true,
        ci006ResilienceOk: true,
        ci007ValidationOk: true,
        ci008DrVerified: true,
        rpoOk: true,
        rtoOk: true,
        authOk: true,
        rbacOk: true,
        tenantIsolationOk: true,
        dbIntegrityOk: true,
        backupOk: true,
        observabilityOk: true,
        incidentResponseOk: true,
        capacityOk: true,
        configOk: true,
        deploymentOk: true,
        rollbackOk: true,
        testingOk: true,
        buildOk: true,
        regressionOk: true,
        securityProtectionOk: true,
        auditabilityOk: true,
      });

      const score = ProductionCertificationPolicy.calculateReadinessScore(gates);
      expect(score.totalScore).toBe(100);
      expect(score.level).toBe(CertificationLevelEnum.GO_LIVE_READY);
    });

    it("should enforce Critical Gate Override rule: downgrade level if critical gate fails", () => {
      const gates = ProductionCertificationPolicy.evaluate26Gates({
        m1m12Frozen: true,
        ci001WorkerOk: true,
        ci002SloOk: true,
        ci003AlertOk: true,
        ci004TelemetryOk: true,
        ci005PredictiveOk: true,
        ci006ResilienceOk: true,
        ci007ValidationOk: true,
        ci008DrVerified: false, // Critical failure
        rpoOk: true,
        rtoOk: true,
        authOk: true,
        rbacOk: true,
        tenantIsolationOk: true,
        dbIntegrityOk: true,
        backupOk: true,
        observabilityOk: true,
        incidentResponseOk: true,
        capacityOk: true,
        configOk: true,
        deploymentOk: true,
        rollbackOk: true,
        testingOk: true,
        buildOk: true,
        regressionOk: true,
        securityProtectionOk: true,
        auditabilityOk: true,
      });

      const score = ProductionCertificationPolicy.calculateReadinessScore(gates);
      expect(score.failedCriticalGatesCount).toBe(1);
      expect(score.level).toBe(CertificationLevelEnum.CONDITIONALLY_READY);
    });
  });

  describe("2. ProductionCertificationService Execution", () => {
    let service: ProductionCertificationService;

    beforeEach(() => {
      service = new ProductionCertificationService();
    });

    it("should evaluate 26 gates and calculate readiness score", async () => {
      const score = await service.calculateReadinessScore(companyA);
      expect(score.totalScore).toBeGreaterThanOrEqual(0);
      expect(score.level).toBeDefined();
    });

    it("should return security assessment and DR summary", async () => {
      const security = await service.getSecurityAssessment(companyA);
      expect(security.authenticationVerified).toBe(true);
      expect(security.tenantIsolationEnforced).toBe(true);

      const drSummary = await service.getDRSummary(companyA);
      expect(drSummary.targetRPO).toBe(5);
      expect(drSummary.targetRTO).toBe(15);
    });

    it("should execute administrative sign-off and upgrade level to PRODUCTION_CERTIFIED", async () => {
      // First achieve DR_VERIFIED status via backup recovery service
      await backupRecoveryService.executeStagingRestore({
        environment: "staging",
        restoreTarget: "staging_isolated_drill_db",
      }, companyA, null as any);

      // Ensure validation controls pass
      await productionValidationService.executeSafeValidation("scen_app_restart", companyA);

      // Ensure DB ping latency and SLO status are healthy for gate evaluation
      const { HealthService } = await import("../health.service");
      vi.spyOn(HealthService.prototype, "getHealth").mockResolvedValue({
        status: "HEALTHY",
        database: { status: "HEALTHY", latencyMs: 5, isConnected: true },
        redis: { status: "HEALTHY", isConnected: true },
      } as any);

      const dashboard = await service.executeAdministrativeSignOff({
        signOffRole: "Lead Enterprise Architect",
        comments: "Enterprise release v1.0.0-GA approved for General Availability",
        confirmGoLiveReady: true,
      }, companyA, null as any);

      expect(dashboard.signOffCompleted).toBe(true);
      expect(dashboard.certificationLevel).toBe(CertificationLevelEnum.PRODUCTION_CERTIFIED);
    }, 15000);
  });
});
