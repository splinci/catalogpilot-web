/**
 * ============================================================================
 * Splinci Commerce OS — CI-004 Telemetry History Test Suite
 * ============================================================================
 * Specification Reference: CI-004 / TEST-004 / TELEMETRY-001 / OBS-001
 * Coverage: TelemetryHistoryPolicy, TelemetryHistoryService, Time-Series Aggregation & Scope Access
 * ============================================================================
 */

import { describe, it, expect, beforeEach } from "vitest";
import { TelemetryHistoryPolicy, TimeSeriesDataPoint } from "../telemetry-history.policy";
import { TelemetryHistoryService } from "../telemetry-history.service";

describe("CI-004 Enterprise Historical Telemetry Test Suite", () => {
  describe("1. TelemetryHistoryPolicy Rules", () => {
    it("should calculate min, max, average, and p95 correctly in aggregateSeries()", () => {
      const rawPoints: TimeSeriesDataPoint[] = [
        { timestamp: "2026-08-10T10:00:00Z", value: 10 },
        { timestamp: "2026-08-10T11:00:00Z", value: 20 },
        { timestamp: "2026-08-10T12:00:00Z", value: 30 },
        { timestamp: "2026-08-10T13:00:00Z", value: 40 },
        { timestamp: "2026-08-10T14:00:00Z", value: 50 },
      ];

      const agg = TelemetryHistoryPolicy.aggregateSeries("DB_LATENCY", rawPoints, "24h", "1h");
      expect(agg.count).toBe(5);
      expect(agg.min).toBe(10);
      expect(agg.max).toBe(50);
      expect(agg.average).toBe(30);
      expect(agg.p95).toBe(50);
    });

    it("should calculate retention cutoff date accurately", () => {
      const refDate = new Date("2026-08-10T12:00:00Z");
      const cutoff30d = TelemetryHistoryPolicy.calculateCutoffDate(30, refDate);
      expect(cutoff30d.toISOString()).toBe("2026-07-11T12:00:00.000Z");
    });

    it("should validate tenant scope isolation in validateScopeAccess()", () => {
      expect(TelemetryHistoryPolicy.validateScopeAccess("cmp_a", "cmp_a")).toBe(true);
      expect(TelemetryHistoryPolicy.validateScopeAccess("cmp_a", "cmp_b")).toBe(false);
      expect(TelemetryHistoryPolicy.validateScopeAccess(undefined, "cmp_a")).toBe(true); // Platform scope
    });
  });

  describe("2. TelemetryHistoryService Execution", () => {
    let service: TelemetryHistoryService;

    beforeEach(() => {
      service = new TelemetryHistoryService();
    });

    it("should sample current telemetry and return database ping latency", async () => {
      const sampled = await service.sampleCurrentTelemetry();
      expect(sampled.sampledAt).toBeDefined();
      expect(sampled.dbLatencyMs).toBeGreaterThanOrEqual(0);
      expect(sampled.status).toBe("OK");
    });

    it("should retrieve time-series history summary for DB_LATENCY", async () => {
      await service.sampleCurrentTelemetry();
      const history = await service.getTimeSeriesHistory("DB_LATENCY", "24h", "cmp_tenant_1");

      expect(history.metricName).toBe("DB_LATENCY");
      expect(history.window).toBe("24h");
      expect(history.series.length).toBeGreaterThan(0);
      expect(history.average).toBeGreaterThanOrEqual(0);
    });

    it("should return historical SLO trend summary", async () => {
      const sloTrend = await service.getSLOTrendHistory();
      expect(sloTrend.trend).toBe("STABLE_HEALTHY");
      expect(sloTrend.slos.length).toBe(10);
    });
  });
});
