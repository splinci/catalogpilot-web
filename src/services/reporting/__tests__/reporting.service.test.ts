/**
 * ============================================================================
 * Ondrio Commerce OS — Reporting & BI Service Layer Test Suite
 * ============================================================================
 * Specification Reference: M10-002 / TEST-001 / SAD-001
 * Coverage: Reporting Policy Engine, Growth %, Business Health Score, Services
 * ============================================================================
 */

import { ReportingPolicy } from "../reporting.policy";
import { reportingService } from "@/services/reporting.service";

describe("M10-002 Enterprise Reporting & BI Service Layer Test Suite", () => {
  describe("Reporting Policy Engine", () => {
    it("should correctly calculate growth percentage", () => {
      const growth = ReportingPolicy.calculateGrowthPercent(150, 100);
      expect(growth).toBe(50);
    });

    it("should correctly handle zero previous value in growth calculation", () => {
      const growth = ReportingPolicy.calculateGrowthPercent(100, 0);
      expect(growth).toBe(100);
    });

    it("should calculate target variance correctly", () => {
      const result = ReportingPolicy.calculateVariance(120, 100);
      expect(result.variance).toBe(20);
      expect(result.variancePercent).toBe(20);
    });

    it("should compute moving averages across numeric series", () => {
      const series = [10, 20, 30, 40, 50];
      const avg = ReportingPolicy.calculateMovingAverage(series, 3);
      expect(avg).toHaveLength(5);
      expect(avg[2]).toBe(20); // (10+20+30)/3
    });

    it("should compute composite Business Health Score (0-100)", () => {
      const health = ReportingPolicy.calculateBusinessHealthScore({
        revenueGrowthPercent: 12.4,
        grossProfitMarginPercent: 40.0,
        collectionEfficiencyPercent: 91.8,
        onTimeDeliveryRate: 95.5,
      });

      expect(health.score).toBeGreaterThanOrEqual(0);
      expect(health.score).toBeLessThanOrEqual(100);
      expect(["EXCELLENT", "STRONG", "FAIR", "CRITICAL"]).toContain(health.rating);
    });
  });

  describe("Reporting Service Facade", () => {
    it("should export all domain service singletons", () => {
      expect(reportingService.dashboard).toBeDefined();
      expect(reportingService.sales).toBeDefined();
      expect(reportingService.inventory).toBeDefined();
      expect(reportingService.purchasing).toBeDefined();
      expect(reportingService.finance).toBeDefined();
      expect(reportingService.crm).toBeDefined();
      expect(reportingService.executiveKPI).toBeDefined();
      expect(reportingService.analytics).toBeDefined();
      expect(reportingService.scheduled).toBeDefined();
    });
  });
});
