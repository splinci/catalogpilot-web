/**
 * ============================================================================
 * Splinci Commerce OS — GO-001 Production Go-Live Test Suite
 * ============================================================================
 * Specification Reference: GO-001 / TEST-001 / GOLIVE-001 / ENG-001
 * Coverage: GoLivePolicy, GoLiveService, Preflight, Smoke-Test & Stabilization
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { GoLivePolicy } from "../go-live.policy";
import { GoLiveService } from "../go-live.service";
import { GoLiveStatusEnum, ConfigCheckStatusEnum } from "../../../types/operations-golive.dto";

describe("GO-001 Enterprise Production Go-Live Test Suite", () => {
  const companyA = "cmp_ci_tenant_a";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "GO_LIVE_TENANT", legalName: "Go Live Legal", displayName: "Go Live Tenant" },
      update: {},
    });
  });

  describe("1. GoLivePolicy Rules", () => {
    it("should sanitize and validate environment variables without exposing secrets", () => {
      const config = GoLivePolicy.validateEnvironmentConfig({
        DATABASE_URL: "postgresql://user:secret_pass@localhost:5432/db",
        NODE_ENV: "production",
        AUTH_SECRET: "super_secret_jwt_token",
      });

      expect(config.overallStatus).toBe(ConfigCheckStatusEnum.VALID);
      expect(config.checks.length).toBeGreaterThan(0);

      // Verify ZERO secrets exposed in check notes
      const serialized = JSON.stringify(config);
      expect(serialized).not.toContain("secret_pass");
      expect(serialized).not.toContain("super_secret_jwt_token");
    });

    it("should evaluate all 30 mandatory governance acceptance gates", () => {
      const gates = GoLivePolicy.evaluate30Gates({
        m1m12Frozen: true,
        ci001ToCi009Compatible: true,
        configValid: true,
        deploymentReady: true,
        healthVerified: true,
        dbVerified: true,
        authVerified: true,
        rbacVerified: true,
        tenantIsolationVerified: true,
        outboxWorkerVerified: true,
        queueVerified: true,
        sloVerified: true,
        alertingVerified: true,
        telemetryVerified: true,
        predictiveCapacityVerified: true,
        resilienceVerified: true,
        drVerified: true,
        smokeTestPassed: true,
        baselineCaptured: true,
        rollbackReady: true,
        stabilization24hProcedureReady: true,
        stabilization7dProcedureReady: true,
        securityScanClean: true,
        auditVerified: true,
        testSuitePassed: true,
        productionBuildPassed: true,
        regressionPassed: true,
        runbookActive: true,
        controlledProductionReady: true,
        productionObservationExecuted: false,
      });

      expect(gates.length).toBe(30);
      expect(gates.filter((g) => g.status === "PASS").length).toBe(29);
      // GATE 30 remains NOT_VERIFIED until real production observation
      expect(gates.find((g) => g.id === "GATE_30")?.status).toBe("NOT_VERIFIED");
    });

    it("should return CONTROLLED_LAUNCH when smoke tests pass but production observation is pending", () => {
      const gates = GoLivePolicy.evaluate30Gates({
        m1m12Frozen: true,
        ci001ToCi009Compatible: true,
        configValid: true,
        deploymentReady: true,
        healthVerified: true,
        dbVerified: true,
        authVerified: true,
        rbacVerified: true,
        tenantIsolationVerified: true,
        outboxWorkerVerified: true,
        queueVerified: true,
        sloVerified: true,
        alertingVerified: true,
        telemetryVerified: true,
        predictiveCapacityVerified: true,
        resilienceVerified: true,
        drVerified: true,
        smokeTestPassed: true,
        baselineCaptured: true,
        rollbackReady: true,
        stabilization24hProcedureReady: true,
        stabilization7dProcedureReady: true,
        securityScanClean: true,
        auditVerified: true,
        testSuitePassed: true,
        productionBuildPassed: true,
        regressionPassed: true,
        runbookActive: true,
        controlledProductionReady: true,
        productionObservationExecuted: false,
      });

      const status = GoLivePolicy.evaluateGoLiveStatus(gates, true, false);
      expect(status).toBe(GoLiveStatusEnum.CONTROLLED_LAUNCH);
    });
  });

  describe("2. GoLiveService Execution", () => {
    let service: GoLiveService;

    beforeEach(() => {
      service = new GoLiveService();
    });

    it("should validate production config safely", async () => {
      const config = await service.validateProductionConfig(companyA);
      expect(config.evaluatedAt).toBeDefined();
      expect(config.checks.length).toBeGreaterThan(0);
    });

    it("should execute preflight check and non-destructive smoke test", async () => {
      const preflight = await service.executePreflight(companyA);
      expect(preflight.passedChecksCount).toBeGreaterThan(0);

      const smoke = await service.executeSmokeTest(companyA, null as any);
      expect(smoke.executedAt).toBeDefined();
      expect(smoke.appStatus).toBe("HEALTHY");
    });

    it("should capture baseline snapshot and return stabilization summaries", async () => {
      const snapshot = await service.captureBaseline(companyA);
      expect(snapshot.version).toBe("v1.0.0-GA");
      expect(snapshot.dbConnected).toBe(true);

      const stab24h = await service.get24HourStabilizationSummary(companyA);
      expect(stab24h.window).toBe("24h");
      expect(stab24h.availabilityPercent).toBe(100.0);

      const stab7d = await service.get7DayStabilizationSummary(companyA);
      expect(stab7d.window).toBe("7d");
      expect(stab7d.status).toBe("STABLE");
    });

    it("should assemble complete go-live dashboard DTO payload", async () => {
      const dashboard = await service.getGoLiveDashboard(companyA);
      expect(dashboard.evaluatedAt).toBeDefined();
      expect(dashboard.gates.length).toBe(30);
      expect(dashboard.configValidation).toBeDefined();
    }, 15000);
  });
});
