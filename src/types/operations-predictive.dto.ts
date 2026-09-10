/**
 * ============================================================================
 * Splinci Commerce OS — Predictive Operations Data Contracts & DTOs
 * ============================================================================
 * Specification Reference: CI-005 / DTO-001 / PREDICTIVE-001 / ENG-001
 * Strongly Typed Zod Schemas & Interfaces for Capacity Planning & Predictive Intelligence
 * ============================================================================
 */

import { z } from "zod";

export enum CapacitySaturationEnum {
  NORMAL = "NORMAL",
  ELEVATED = "ELEVATED",
  HIGH = "HIGH",
  SATURATED = "SATURATED",
}

export enum PredictiveRiskLevelEnum {
  LOW = "LOW",
  MODERATE = "MODERATE",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export const CapacityMetricSchema = z.object({
  metricName: z.string(),
  currentValue: z.number(),
  baselineValue: z.number(),
  peakValue: z.number(),
  trendPercent: z.number(),
  saturationState: z.nativeEnum(CapacitySaturationEnum),
  unit: z.string(),
});

export type CapacityMetricDto = z.infer<typeof CapacityMetricSchema>;

export const ForecastResultSchema = z.object({
  metricName: z.string(),
  window: z.enum(["24h", "7d", "30d"]),
  historicalAverage: z.number(),
  forecastedValue: z.number(),
  projectedChangePercent: z.number(),
  slope: z.number(),
  explanation: z.string(),
});

export type ForecastResultDto = z.infer<typeof ForecastResultSchema>;

export const SLOPredictionSchema = z.object({
  sloId: z.string(),
  name: z.string(),
  currentObservedPercent: z.number(),
  errorBudgetRemainingPercent: z.number(),
  projectedBurnRatePercent: z.number(),
  projectedExhaustionDays: z.number().nullable(),
  riskLevel: z.nativeEnum(PredictiveRiskLevelEnum),
});

export type SLOPredictionDto = z.infer<typeof SLOPredictionSchema>;

export const CapacityRecommendationSchema = z.object({
  id: z.string(),
  metricName: z.string(),
  currentValue: z.number(),
  threshold: z.number(),
  forecastedValue: z.number(),
  recommendedAction: z.string(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  confidence: z.string(),
});

export type CapacityRecommendationDto = z.infer<typeof CapacityRecommendationSchema>;

export const PredictiveOperationsDashboardSchema = z.object({
  evaluatedAt: z.string(),
  companyId: z.string().optional(),
  executiveSummary: z.object({
    overallPlatformRisk: z.nativeEnum(PredictiveRiskLevelEnum),
    outboxWorkerSaturation: z.nativeEnum(CapacitySaturationEnum),
    databaseLatencyRisk: z.nativeEnum(PredictiveRiskLevelEnum),
    activeRecommendationsCount: z.number(),
  }),
  capacityMetrics: z.array(CapacityMetricSchema),
  forecasts: z.array(ForecastResultSchema),
  sloPredictions: z.array(SLOPredictionSchema),
  recommendations: z.array(CapacityRecommendationSchema),
});

export type PredictiveOperationsDashboardDto = z.infer<typeof PredictiveOperationsDashboardSchema>;
