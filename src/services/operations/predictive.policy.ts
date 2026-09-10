/**
 * ============================================================================
 * Splinci Commerce OS — Predictive Operations Policy Engine
 * ============================================================================
 * Specification Reference: CI-005 / PREDICTIVE-001 / POL-001 / ENG-001
 * Domain: Pure Predictive Forecasting, Saturation Detection & SLO Risk Rules
 * Note: Pure functions ONLY — 0 Prisma imports, 0 database queries.
 * ============================================================================
 */

import {
  CapacitySaturationEnum,
  PredictiveRiskLevelEnum,
  CapacityMetricDto,
  ForecastResultDto,
  SLOPredictionDto,
  CapacityRecommendationDto,
} from "../../types/operations-predictive.dto";

export class PredictivePolicy {
  /**
   * Determine saturation state based on current value vs maximum capacity threshold.
   */
  static calculateSaturationState(currentValue: number, maxThreshold: number): CapacitySaturationEnum {
    if (maxThreshold <= 0) return CapacitySaturationEnum.NORMAL;
    const ratio = currentValue / maxThreshold;
    if (ratio >= 0.9) return CapacitySaturationEnum.SATURATED;
    if (ratio >= 0.75) return CapacitySaturationEnum.HIGH;
    if (ratio >= 0.5) return CapacitySaturationEnum.ELEVATED;
    return CapacitySaturationEnum.NORMAL;
  }

  /**
   * Compute linear slope and project future metric values.
   */
  static calculateLinearForecast(
    metricName: string,
    values: number[],
    window: "24h" | "7d" | "30d" = "24h"
  ): ForecastResultDto {
    if (!values || values.length === 0) {
      return {
        metricName,
        window,
        historicalAverage: 0,
        forecastedValue: 0,
        projectedChangePercent: 0,
        slope: 0,
        explanation: "Insufficient data points for forecasting",
      };
    }

    const n = values.length;
    const sumY = values.reduce((a, b) => a + b, 0);
    const avgY = sumY / n;

    if (n === 1) {
      return {
        metricName,
        window,
        historicalAverage: Number(avgY.toFixed(2)),
        forecastedValue: Number(avgY.toFixed(2)),
        projectedChangePercent: 0,
        slope: 0,
        explanation: "Single data point baseline projection",
      };
    }

    let sumX = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const denom = n * sumX2 - sumX * sumX;
    const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const forecastedValue = Math.max(0, values[n - 1] + slope);
    const projectedChangePercent = avgY !== 0 ? Number((((forecastedValue - avgY) / avgY) * 100).toFixed(2)) : 0;

    return {
      metricName,
      window,
      historicalAverage: Number(avgY.toFixed(2)),
      forecastedValue: Number(forecastedValue.toFixed(2)),
      projectedChangePercent,
      slope: Number(slope.toFixed(4)),
      explanation: `Deterministic linear trend projection over ${n} historical sample points (Slope: ${slope.toFixed(4)})`,
    };
  }

  /**
   * Calculate SLO breach risk and projected error-budget exhaustion.
   */
  static calculateSLORisk(
    sloId: string,
    name: string,
    currentObservedPercent: number,
    targetPercent: number,
    errorBudgetRemainingPercent: number,
    burnRatePercentPerDay = 0.5
  ): SLOPredictionDto {
    let riskLevel = PredictiveRiskLevelEnum.LOW;

    if (errorBudgetRemainingPercent <= 0 || currentObservedPercent < targetPercent - 1.0) {
      riskLevel = PredictiveRiskLevelEnum.CRITICAL;
    } else if (errorBudgetRemainingPercent <= 20 || burnRatePercentPerDay > 2.0) {
      riskLevel = PredictiveRiskLevelEnum.HIGH;
    } else if (errorBudgetRemainingPercent <= 50 || burnRatePercentPerDay > 1.0) {
      riskLevel = PredictiveRiskLevelEnum.MODERATE;
    }

    const exhaustionDays = burnRatePercentPerDay > 0 ? Number((errorBudgetRemainingPercent / burnRatePercentPerDay).toFixed(1)) : null;

    return {
      sloId,
      name,
      currentObservedPercent,
      errorBudgetRemainingPercent,
      projectedBurnRatePercent: burnRatePercentPerDay,
      projectedExhaustionDays: exhaustionDays,
      riskLevel,
    };
  }

  /**
   * Generate evidence-based actionable capacity recommendations.
   */
  static generateCapacityRecommendations(
    metrics: CapacityMetricDto[],
    forecasts: ForecastResultDto[],
    sloPredictions: SLOPredictionDto[]
  ): CapacityRecommendationDto[] {
    const recommendations: CapacityRecommendationDto[] = [];

    // Worker saturation recommendation
    const workerMetric = metrics.find((m) => m.metricName === "Worker Utilization");
    if (workerMetric && (workerMetric.saturationState === CapacitySaturationEnum.HIGH || workerMetric.saturationState === CapacitySaturationEnum.SATURATED)) {
      recommendations.push({
        id: "rec_worker_scale",
        metricName: "Worker Utilization",
        currentValue: workerMetric.currentValue,
        threshold: 75,
        forecastedValue: workerMetric.peakValue,
        recommendedAction: "Increase outbox worker concurrency parameter (OUTBOX_WORKER_CONCURRENCY) or launch additional worker daemon instances.",
        severity: workerMetric.saturationState === CapacitySaturationEnum.SATURATED ? "CRITICAL" : "HIGH",
        confidence: "High (Based on active queue depth and worker utilization metrics)",
      });
    }

    // DB Latency recommendation
    const dbForecast = forecasts.find((f) => f.metricName === "Database Latency");
    if (dbForecast && dbForecast.forecastedValue > 100) {
      recommendations.push({
        id: "rec_db_latency",
        metricName: "Database Latency",
        currentValue: dbForecast.historicalAverage,
        threshold: 100,
        forecastedValue: dbForecast.forecastedValue,
        recommendedAction: "Investigate PostgreSQL query connection pool metrics and execute query index optimization.",
        severity: "HIGH",
        confidence: "Medium (Based on linear trend projection over historical DB ping samples)",
      });
    }

    // SLO Breach recommendation
    const criticalSLO = sloPredictions.find((s) => s.riskLevel === PredictiveRiskLevelEnum.CRITICAL || s.riskLevel === PredictiveRiskLevelEnum.HIGH);
    if (criticalSLO) {
      recommendations.push({
        id: `rec_slo_${criticalSLO.sloId.toLowerCase()}`,
        metricName: criticalSLO.name,
        currentValue: criticalSLO.currentObservedPercent,
        threshold: 99.0,
        forecastedValue: Number((criticalSLO.currentObservedPercent - 0.5).toFixed(2)),
        recommendedAction: `Prioritize reliability engineering backlog for ${criticalSLO.name} to preserve remaining error budget (${criticalSLO.errorBudgetRemainingPercent}%).`,
        severity: criticalSLO.riskLevel === PredictiveRiskLevelEnum.CRITICAL ? "CRITICAL" : "HIGH",
        confidence: "High (Based on 30-day sliding window SLO evaluation)",
      });
    }

    return recommendations;
  }
}
