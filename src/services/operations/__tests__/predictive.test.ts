/**
 * ============================================================================
 * Splinci Commerce OS — CI-005 Predictive Operations Test Suite
 * ============================================================================
 * Specification Reference: CI-005 / TEST-005 / PREDICTIVE-001 / ENG-001
 * Coverage: PredictivePolicy, PredictiveOperationsService, Linear Forecasting & Saturation Rules
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { PredictivePolicy } from "../predictive.policy";
import { PredictiveOperationsService } from "../predictive.service";
import {
  CapacitySaturationEnum,
  PredictiveRiskLevelEnum,
} from "../../../types/operations-predictive.dto";

describe("CI-005 Enterprise Predictive Operations Test Suite", () => {
  const companyA = "cmp_ci_tenant_a";

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "CI_PREDICTIVE_TENANT", legalName: "CI Predictive Legal", displayName: "CI Predictive Tenant" },
      update: {},
    });
  });

  describe("1. PredictivePolicy Rules", () => {
    it("should calculate saturation state correctly", () => {
      expect(PredictivePolicy.calculateSaturationState(20, 100)).toBe(CapacitySaturationEnum.NORMAL);
      expect(PredictivePolicy.calculateSaturationState(60, 100)).toBe(CapacitySaturationEnum.ELEVATED);
      expect(PredictivePolicy.calculateSaturationState(80, 100)).toBe(CapacitySaturationEnum.HIGH);
      expect(PredictivePolicy.calculateSaturationState(95, 100)).toBe(CapacitySaturationEnum.SATURATED);
    });

    it("should calculate deterministic linear forecast and slope accurately", () => {
      const values = [10, 20, 30, 40, 50]; // Slope = 10
      const forecast = PredictivePolicy.calculateLinearForecast("Queue Depth", values, "24h");

      expect(forecast.metricName).toBe("Queue Depth");
      expect(forecast.historicalAverage).toBe(30);
      expect(forecast.forecastedValue).toBe(60);
      expect(forecast.slope).toBe(10);
    });

    it("should evaluate SLO risk and projected exhaustion days", () => {
      const riskLow = PredictivePolicy.calculateSLORisk("SLO_1", "App Availability", 99.9, 99.9, 100, 0.1);
      expect(riskLow.riskLevel).toBe(PredictiveRiskLevelEnum.LOW);

      const riskCritical = PredictivePolicy.calculateSLORisk("SLO_2", "DB Latency", 98.0, 99.5, 0, 2.5);
      expect(riskCritical.riskLevel).toBe(PredictiveRiskLevelEnum.CRITICAL);
    });

    it("should generate actionable capacity recommendations when thresholds are exceeded", () => {
      const metrics = [
        {
          metricName: "Worker Utilization",
          currentValue: 92,
          baselineValue: 20,
          peakValue: 95,
          trendPercent: 10,
          saturationState: CapacitySaturationEnum.SATURATED,
          unit: "%",
        },
      ];

      const recommendations = PredictivePolicy.generateCapacityRecommendations(metrics, [], []);
      expect(recommendations.length).toBe(1);
      expect(recommendations[0].id).toBe("rec_worker_scale");
      expect(recommendations[0].severity).toBe("CRITICAL");
    });
  });

  describe("2. PredictiveOperationsService Execution", () => {
    let service: PredictiveOperationsService;

    beforeEach(() => {
      service = new PredictiveOperationsService();
    });

    it("should return capacity utilization metrics", async () => {
      const metrics = await service.getCapacityMetrics(companyA);
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].metricName).toBe("Worker Utilization");
    });

    it("should generate 24h linear trend forecasts", async () => {
      const forecasts = await service.getForecasts(companyA);
      expect(forecasts.length).toBeGreaterThan(0);
      expect(forecasts[0].forecastedValue).toBeGreaterThanOrEqual(0);
    });

    it("should return predictive SLO risk evaluations", async () => {
      const sloRisks = await service.getSLORiskPredictions(companyA);
      expect(sloRisks.length).toBe(10);
      expect(sloRisks[0].riskLevel).toBeDefined();
    });

    it("should assemble complete predictive operations dashboard DTO", async () => {
      const dashboard = await service.getPredictiveDashboard(companyA);
      expect(dashboard.evaluatedAt).toBeDefined();
      expect(dashboard.executiveSummary.overallPlatformRisk).toBeDefined();
      expect(dashboard.capacityMetrics.length).toBeGreaterThan(0);
      expect(dashboard.sloPredictions.length).toBe(10);
    });
  });
});
