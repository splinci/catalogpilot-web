/**
 * ============================================================================
 * Splinci Commerce OS — Telemetry History Policy Engine
 * ============================================================================
 * Specification Reference: CI-004 / TELEMETRY-001 / POL-001 / ENG-001
 * Domain: Pure Time-Series Telemetry Aggregation, Bucketing & Retention Policy
 * Note: Pure functions ONLY — 0 Prisma imports, 0 database queries.
 * ============================================================================
 */

export interface TimeSeriesDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface TimeSeriesAggregateSummary {
  metricName: string;
  window: "24h" | "7d" | "30d";
  interval: "5m" | "1h" | "1d";
  count: number;
  min: number;
  max: number;
  average: number;
  p95: number;
  series: TimeSeriesDataPoint[];
}

export class TelemetryHistoryPolicy {
  /** Configurable Retention Policy Defaults */
  static readonly RETENTION_RAW_DAYS = 30;
  static readonly RETENTION_HOURLY_DAYS = 180;
  static readonly RETENTION_DAILY_DAYS = 730; // 2 Years

  /**
   * Calculate retention cutoff date for a given retention tier.
   */
  static calculateCutoffDate(days: number, referenceDate = new Date()): Date {
    return new Date(referenceDate.getTime() - days * 24 * 3600 * 1000);
  }

  /**
   * Aggregate a raw array of numerical data points into a time-series summary.
   */
  static aggregateSeries(
    metricName: string,
    rawPoints: TimeSeriesDataPoint[],
    window: "24h" | "7d" | "30d" = "24h",
    interval: "5m" | "1h" | "1d" = "1h"
  ): TimeSeriesAggregateSummary {
    if (!rawPoints || rawPoints.length === 0) {
      return {
        metricName,
        window,
        interval,
        count: 0,
        min: 0,
        max: 0,
        average: 0,
        p95: 0,
        series: [],
      };
    }

    const values = rawPoints.map((p) => p.value).sort((a, b) => a - b);
    const count = values.length;
    const min = values[0];
    const max = values[count - 1];
    const sum = values.reduce((acc, v) => acc + v, 0);
    const average = Number((sum / count).toFixed(2));

    // Calculate p95 index
    const p95Index = Math.min(count - 1, Math.floor(count * 0.95));
    const p95 = values[p95Index];

    return {
      metricName,
      window,
      interval,
      count,
      min,
      max,
      average,
      p95,
      series: rawPoints,
    };
  }

  /**
   * Validate that tenant-scoped query does not leak cross-tenant data.
   */
  static validateScopeAccess(targetCompanyId?: string, sessionCompanyId?: string): boolean {
    if (!targetCompanyId) return true; // Platform scope query
    return targetCompanyId === sessionCompanyId;
  }
}
