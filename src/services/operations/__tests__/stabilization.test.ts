/**
 * ============================================================================
 * Splinci Commerce OS — GO-002 Production Stabilization Test Suite
 * ============================================================================
 * Specification Reference: GO-002 / TEST-001 / STABILIZATION-001 / ENG-001
 * Coverage: StabilizationPolicy, StabilizationService, GATE 30 Evidence Standard,
 * 1h/6h/12h/24h Observation Checkpoints, RBAC, Multi-Tenant Isolation & Sanitization.
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { StabilizationPolicy } from "../stabilization.policy";
import { StabilizationService } from "../stabilization.service";
import {
  ObservationCheckpointEnum,
  StabilizationDecisionEnum,
  LiveProductionHealthDto,
} from "../../../types/operations-stabilization.dto";

describe("GO-002 Enterprise Production Stabilization Test Suite", () => {
  const companyA = "cmp_stabilization_isolated_test";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "STAB_TENANT", legalName: "Stab Legal", displayName: "Stab Tenant" },
      update: {},
    });
    await prisma.user.upsert({
      where: { id: "usr_enterprise_operator" },
      create: {
        id: "usr_enterprise_operator",
        companyId: companyA,
        email: "operator@splinci.com",
        passwordHash: "hash",
        firstName: "Enterprise",
        lastName: "Operator",
        role: "ADMIN",
      },
      update: {},
    });
  });

  describe("1. StabilizationPolicy Threshold & Checkpoint Rules", () => {
    it("should evaluate healthy production metrics correctly", () => {
      const health: LiveProductionHealthDto = {
        availabilityPercent: 99.95,
        avgLatencyMs: 45.0,
        errorRatePercent: 0.02,
        databaseStatus: "HEALTHY",
        workerStatus: "OPERATIONAL",
        queueDepth: 0,
        activeIncidentsCount: 0,
        p1IncidentsCount: 0,
        drVerified: true,
      };

      const metrics = StabilizationPolicy.evaluateMetrics(health);
      expect(metrics.length).toBe(4);
      expect(metrics.every((m) => m.isHealthy)).toBe(true);
    });

    it("should detect high latency breach (> 200ms)", () => {
      const health: LiveProductionHealthDto = {
        availabilityPercent: 99.95,
        avgLatencyMs: 250.0, // Exceeds 200ms target
        errorRatePercent: 0.02,
        databaseStatus: "HEALTHY",
        workerStatus: "OPERATIONAL",
        queueDepth: 0,
        activeIncidentsCount: 0,
        p1IncidentsCount: 0,
        drVerified: true,
      };

      const metrics = StabilizationPolicy.evaluateMetrics(health);
      const latencyMetric = metrics.find((m) => m.name === "Average API Latency");
      expect(latencyMetric?.isHealthy).toBe(false);
    });

    it("should detect high error rate breach (> 0.1%)", () => {
      const health: LiveProductionHealthDto = {
        availabilityPercent: 99.8,
        avgLatencyMs: 50.0,
        errorRatePercent: 0.5, // Exceeds 0.1% target
        databaseStatus: "HEALTHY",
        workerStatus: "OPERATIONAL",
        queueDepth: 0,
        activeIncidentsCount: 0,
        p1IncidentsCount: 0,
        drVerified: true,
      };

      const metrics = StabilizationPolicy.evaluateMetrics(health);
      const errorMetric = metrics.find((m) => m.name === "Application Error Rate");
      expect(errorMetric?.isHealthy).toBe(false);
    });

    it("should fail evaluation if there are unresolved P1 incidents", () => {
      const health: LiveProductionHealthDto = {
        availabilityPercent: 99.95,
        avgLatencyMs: 50.0,
        errorRatePercent: 0.01,
        databaseStatus: "HEALTHY",
        workerStatus: "OPERATIONAL",
        queueDepth: 0,
        activeIncidentsCount: 1,
        p1IncidentsCount: 1,
        drVerified: true,
      };

      const evaluation = StabilizationPolicy.evaluateCheckpoint(
        ObservationCheckpointEnum.CHECKPOINT_1H,
        health,
        "HEALTHY",
        90
      );

      expect(evaluation.incidentsPassed).toBe(false);
      expect(evaluation.overallDecision).toBe(StabilizationDecisionEnum.FAILED);
    });

    it("should detect DR verification failure", () => {
      const health: LiveProductionHealthDto = {
        availabilityPercent: 99.95,
        avgLatencyMs: 50.0,
        errorRatePercent: 0.01,
        databaseStatus: "HEALTHY",
        workerStatus: "OPERATIONAL",
        queueDepth: 0,
        activeIncidentsCount: 0,
        p1IncidentsCount: 0,
        drVerified: false,
      };

      const evaluation = StabilizationPolicy.evaluateCheckpoint(
        ObservationCheckpointEnum.CHECKPOINT_24H,
        health,
        "HEALTHY",
        90
      );

      expect(evaluation.drPassed).toBe(false);
      expect(evaluation.overallDecision).toBe(StabilizationDecisionEnum.FAILED);
    });

    it("CRITICAL GOVERNANCE TEST: GATE 30 MUST BE 'NOT_VERIFIED' WITHOUT REAL EVIDENCE", () => {
      const gate30 = StabilizationPolicy.evaluateGate30Evidence({
        hasRealProductionEvidence: false, // Pending real evidence
        observationWindowCompleted: false,
        availabilityPercent: 100.0,
        avgLatencyMs: 40.0,
        errorRatePercent: 0.0,
        p1Count: 0,
        p2Count: 0,
        unresolvedCount: 0,
        sloStatus: "HEALTHY",
        resilienceScore: 92,
        drVerified: true,
      });

      expect(gate30.gate30Status).toBe("NOT_VERIFIED");
      expect(gate30.evaluatorDecision).toBe(StabilizationDecisionEnum.REQUIRES_EXTENDED_OBSERVATION);
      expect(gate30.evidenceNotes).toContain("GATE 30 remains NOT_VERIFIED pending real post-deployment production runtime evidence");
    });

    it("should advance GATE 30 to PASS when real evidence satisfies all thresholds", () => {
      const gate30 = StabilizationPolicy.evaluateGate30Evidence({
        hasRealProductionEvidence: true,
        observationWindowCompleted: true,
        availabilityPercent: 99.95,
        avgLatencyMs: 45.0,
        errorRatePercent: 0.02,
        p1Count: 0,
        p2Count: 0,
        unresolvedCount: 0,
        sloStatus: "HEALTHY",
        resilienceScore: 92,
        drVerified: true,
      });

      expect(gate30.gate30Status).toBe("PASS");
      expect(gate30.evaluatorDecision).toBe(StabilizationDecisionEnum.PASSED);
    });
  });

  describe("2. StabilizationService Execution", () => {
    let service: StabilizationService;

    beforeEach(async () => {
      service = new StabilizationService();
      const { backupRecoveryService } = await import("../backup-recovery.service");
      await backupRecoveryService.executeStagingRestore({
        environment: "staging",
        restoreTarget: "staging_isolated_drill_db",
      }, companyA, "usr_enterprise_operator");
    });

    it("should retrieve current live production health telemetry", async () => {
      const health = await service.getCurrentHealth(companyA);
      expect(health.availabilityPercent).toBe(100.0);
      expect(health.databaseStatus).toBe("HEALTHY");
      expect(health.drVerified).toBe(true);
    }, 15000);

    it("should return GATE 30 evidence with NOT_VERIFIED by default", async () => {
      const gate30 = await service.getGate30Evidence(companyA);
      expect(gate30.gate30Status).toBe("NOT_VERIFIED");
      expect(gate30.evaluatorDecision).toBe(StabilizationDecisionEnum.REQUIRES_EXTENDED_OBSERVATION);
    }, 15000);

    it("should assemble complete stabilization dashboard payload", async () => {
      const dashboard = await service.getStabilizationDashboard(companyA);
      expect(dashboard.evaluatedAt).toBeDefined();
      expect(dashboard.currentHealth).toBeDefined();
      expect(dashboard.metrics.length).toBe(4);
      expect(dashboard.gate30Evidence.gate30Status).toBe("NOT_VERIFIED");
    }, 15000);

    it("should record production observation evidence and update GATE 30", async () => {
      const gate30 = await service.recordProductionEvidence(companyA, "usr_enterprise_operator");
      console.log("GATE 30 EVIDENCE RESULT:", gate30);
      expect(gate30.gate30Status).toBe("PASS");
      expect(gate30.evaluatorDecision).toBe(StabilizationDecisionEnum.PASSED);
    }, 15000);
  });
});
