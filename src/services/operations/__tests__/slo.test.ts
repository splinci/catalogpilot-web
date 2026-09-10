/**
 * ============================================================================
 * Splinci Commerce OS — CI-002 SLO & Error Budget Test Suite
 * ============================================================================
 * Specification Reference: CI-002 / TEST-002 / SLO-001 / OBS-001
 * Coverage: SLOPolicy, Error Budget Calculations, Alert Triggers & SLOService
 * ============================================================================
 */

import { describe, it, expect } from "vitest";
import { SLOPolicy, SLOStatusEnum } from "../slo.policy";
import { SLOService } from "../slo.service";

describe("CI-002 Enterprise Observability, SLO & Error Budget Test Suite", () => {
  describe("1. SLOPolicy Metric Evaluation", () => {
    it("should return HEALTHY when observed metric meets or exceeds target", () => {
      const result = SLOPolicy.evaluateSLO("APP_AVAILABILITY", 99.95);
      expect(result.status).toBe(SLOStatusEnum.HEALTHY);
      expect(result.errorBudgetRemainingPercent).toBeGreaterThanOrEqual(50);
      expect(result.isAlertTriggered).toBe(false);
    });

    it("should return WARNING when error budget drops below 20%", () => {
      // APP_AVAILABILITY target = 99.9% -> Total budget = 0.1%
      // Observed = 99.91% -> Failure = 0.09% -> Budget remaining = 10% (<= 20%)
      const result = SLOPolicy.evaluateSLO("APP_AVAILABILITY", 99.91);
      expect(result.status).toBe(SLOStatusEnum.WARNING);
      expect(result.isAlertTriggered).toBe(true);
      expect(result.remediationAction).toContain("PRIORITIZE_RELIABILITY");
    });

    it("should return BREACHED when observed metric drops below critical threshold", () => {
      // APP_AVAILABILITY critical threshold = 99.0%
      const result = SLOPolicy.evaluateSLO("APP_AVAILABILITY", 98.5);
      expect(result.status).toBe(SLOStatusEnum.BREACHED);
      expect(result.errorBudgetRemainingPercent).toBe(0);
      expect(result.isAlertTriggered).toBe(true);
      expect(result.remediationAction).toContain("FREEZE_NON_CRITICAL_DEPLOYS");
    });

    it("should throw error for unknown SLO identifier", () => {
      expect(() => SLOPolicy.evaluateSLO("UNKNOWN_METRIC", 99.0)).toThrow("Unknown SLO metric identifier");
    });
  });

  describe("2. SLOService Integration", () => {
    it("should evaluate all 10 core enterprise SLOs in getSLOSummary()", async () => {
      const service = new SLOService();
      const summary = await service.getSLOSummary();

      expect(summary.slos.length).toBe(10);
      expect(summary.evaluatedAt).toBeDefined();
      expect(["HEALTHY", "WARNING", "BREACHED"]).toContain(summary.overallStatus);

      const appAvail = summary.slos.find((s) => s.sloId === "APP_AVAILABILITY");
      expect(appAvail).toBeDefined();
      expect(appAvail?.targetPercent).toBe(99.9);
    });
  });
});
