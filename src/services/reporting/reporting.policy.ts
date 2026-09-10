/**
 * ============================================================================
 * Ondrio Commerce OS — Reporting & BI Policy Engine
 * ============================================================================
 * Specification Reference: M10-002 / BSD-008 / SAD-001
 * Pure business policy engine for KPI validation, growth calculations,
 * trend analysis, moving averages, and Business Health Scoring (0 Prisma)
 * ============================================================================
 */

export class ReportingPolicy {
  /**
   * Calculate percentage growth between current period and previous period.
   * Growth % = ((Current - Previous) / Previous) * 100
   */
  static calculateGrowthPercent(current: number, previous: number): number {
    if (previous <= 0) return current > 0 ? 100 : 0;
    const growth = ((current - previous) / previous) * 100;
    return Math.round(growth * 100) / 100;
  }

  /**
   * Calculate variance between actual and target/budget.
   */
  static calculateVariance(actual: number, target: number): { variance: number; variancePercent: number } {
    const variance = actual - target;
    const variancePercent = target > 0 ? (variance / target) * 100 : 0;
    return {
      variance: Math.round(variance * 100) / 100,
      variancePercent: Math.round(variancePercent * 100) / 100,
    };
  }

  /**
   * Calculate simple moving average across a numeric series.
   */
  static calculateMovingAverage(data: number[], windowSize = 3): number[] {
    if (!data || data.length === 0) return [];
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const sub = data.slice(start, i + 1);
      const avg = sub.reduce((a, b) => a + b, 0) / sub.length;
      result.push(Math.round(avg * 100) / 100);
    }
    return result;
  }

  /**
   * Validate date range boundaries for report generation.
   */
  static validateDateRange(startDate?: string, endDate?: string): { start: Date; end: Date } {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date range parameters provided");
    }
    if (start > end) {
      throw new Error("Start date cannot be after end date");
    }
    return { start, end };
  }

  /**
   * Compute composite Ondrio Business Health Score (0–100).
   * Evaluates Revenue Growth (25%), Profit Margin (25%), AR Collection Efficiency (25%), and Stock Turnover (25%).
   */
  static calculateBusinessHealthScore(metrics: {
    revenueGrowthPercent: number;
    grossProfitMarginPercent: number;
    collectionEfficiencyPercent: number;
    onTimeDeliveryRate: number;
  }): { score: number; rating: "EXCELLENT" | "STRONG" | "FAIR" | "CRITICAL" } {
    const revScore = Math.min(100, Math.max(0, (metrics.revenueGrowthPercent + 20) * 2.5));
    const marginScore = Math.min(100, Math.max(0, metrics.grossProfitMarginPercent * 2.5));
    const collectScore = Math.min(100, Math.max(0, metrics.collectionEfficiencyPercent));
    const deliveryScore = Math.min(100, Math.max(0, metrics.onTimeDeliveryRate));

    const totalScore = Math.round(revScore * 0.25 + marginScore * 0.25 + collectScore * 0.25 + deliveryScore * 0.25);

    let rating: "EXCELLENT" | "STRONG" | "FAIR" | "CRITICAL" = "EXCELLENT";
    if (totalScore < 85) rating = "STRONG";
    if (totalScore < 70) rating = "FAIR";
    if (totalScore < 50) rating = "CRITICAL";

    return { score: totalScore, rating };
  }

  /**
   * Validate scheduled report eligibility.
   */
  static validateScheduledReportExecution(schedule: { isEnabled: boolean; recipients: string[] }) {
    if (!schedule.isEnabled) {
      throw new Error("Scheduled report is disabled");
    }
    if (!schedule.recipients || schedule.recipients.length === 0) {
      throw new Error("Scheduled report has no valid email recipients configured");
    }
  }
}
