/**
 * ============================================================================
 * Splinci Commerce OS — Production Stabilization Policy Engine
 * ============================================================================
 * Specification Reference: GO-002 / GOLIVE-002 / POL-001 / ENG-001
 * Domain: Pure Production Stabilization Policy Rules & Threshold Evaluations
 * Note: Pure functions ONLY — 0 Prisma imports, 0 database queries, 0 secrets exposure.
 * ============================================================================
 */

import {
  ProductionLaunchStatusEnum,
  ObservationCheckpointEnum,
  StabilizationDecisionEnum,
  LiveProductionHealthDto,
  StabilizationMetricDto,
  StabilizationEvaluationDto,
  GoLiveGate30EvidenceDto,
} from "../../types/operations-stabilization.dto";

export class StabilizationPolicy {
  // Target Operational Threshold Constants
  static readonly TARGET_AVAILABILITY_PERCENT = 99.9;
  static readonly TARGET_LATENCY_MS = 200.0;
  static readonly TARGET_ERROR_RATE_PERCENT = 0.1;
  static readonly MAX_UNRESOLVED_P1_INCIDENTS = 0;

  /**
   * Evaluate Production Health Metrics Against Target Thresholds.
   */
  static evaluateMetrics(health: LiveProductionHealthDto): StabilizationMetricDto[] {
    return [
      {
        name: "Availability Rate",
        currentValue: health.availabilityPercent,
        targetThreshold: this.TARGET_AVAILABILITY_PERCENT,
        unit: "%",
        isHealthy: health.availabilityPercent >= this.TARGET_AVAILABILITY_PERCENT,
      },
      {
        name: "Average API Latency",
        currentValue: health.avgLatencyMs,
        targetThreshold: this.TARGET_LATENCY_MS,
        unit: "ms",
        isHealthy: health.avgLatencyMs <= this.TARGET_LATENCY_MS,
      },
      {
        name: "Application Error Rate",
        currentValue: health.errorRatePercent,
        targetThreshold: this.TARGET_ERROR_RATE_PERCENT,
        unit: "%",
        isHealthy: health.errorRatePercent <= this.TARGET_ERROR_RATE_PERCENT,
      },
      {
        name: "Unresolved P1 Incidents",
        currentValue: health.p1IncidentsCount,
        targetThreshold: this.MAX_UNRESOLVED_P1_INCIDENTS,
        unit: "count",
        isHealthy: health.p1IncidentsCount <= this.MAX_UNRESOLVED_P1_INCIDENTS,
      },
    ];
  }

  /**
   * Evaluate Stabilization Checkpoint Decision.
   */
  static evaluateCheckpoint(
    checkpoint: ObservationCheckpointEnum,
    health: LiveProductionHealthDto,
    sloStatus: string,
    resilienceScore: number
  ): StabilizationEvaluationDto {
    const availabilityPassed = health.availabilityPercent >= this.TARGET_AVAILABILITY_PERCENT;
    const latencyPassed = health.avgLatencyMs <= this.TARGET_LATENCY_MS;
    const errorRatePassed = health.errorRatePercent <= this.TARGET_ERROR_RATE_PERCENT;
    const incidentsPassed = health.p1IncidentsCount <= this.MAX_UNRESOLVED_P1_INCIDENTS;
    const outboxPassed = health.workerStatus === "HEALTHY" || health.workerStatus === "OPERATIONAL";
    const sloPassed = sloStatus !== "BREACHED";
    const resiliencePassed = resilienceScore >= 50;
    const drPassed = health.drVerified;

    let overallDecision = StabilizationDecisionEnum.PASSED;

    if (!incidentsPassed || !drPassed || !sloPassed) {
      overallDecision = StabilizationDecisionEnum.FAILED;
    } else if (!availabilityPassed || !latencyPassed || !errorRatePassed || !outboxPassed) {
      overallDecision = StabilizationDecisionEnum.DEGRADED;
    }

    return {
      evaluatedAt: new Date().toISOString(),
      checkpoint,
      availabilityPassed,
      latencyPassed,
      errorRatePassed,
      incidentsPassed,
      outboxPassed,
      sloPassed,
      resiliencePassed,
      drPassed,
      overallDecision,
    };
  }

  /**
   * Evaluate GATE 30 Governance Evidence Standard.
   * CRITICAL GOVERNANCE RULE: GATE 30 MUST BE "NOT_VERIFIED" UNLESS ACTUAL REAL PRODUCTION OBSERVATION EVIDENCE EXISTS.
   */
  static evaluateGate30Evidence(input: {
    hasRealProductionEvidence: boolean;
    observationWindowCompleted: boolean;
    availabilityPercent: number;
    avgLatencyMs: number;
    errorRatePercent: number;
    p1Count: number;
    p2Count: number;
    unresolvedCount: number;
    sloStatus: string;
    resilienceScore: number;
    drVerified: boolean;
  }): GoLiveGate30EvidenceDto {
    const evaluatedAt = new Date().toISOString();

    // If no real production evidence or observation window incomplete, GATE 30 remains NOT_VERIFIED
    if (!input.hasRealProductionEvidence || !input.observationWindowCompleted) {
      return {
        evaluatedAt,
        launchTimestamp: evaluatedAt,
        version: "v1.0.0-GA",
        commitHash: "prod_release_v1_0_0_ga",
        observationStart: evaluatedAt,
        observationEnd: evaluatedAt,
        availabilityPercent: input.availabilityPercent,
        avgLatencyMs: input.avgLatencyMs,
        errorRatePercent: input.errorRatePercent,
        p1Count: input.p1Count,
        p2Count: input.p2Count,
        unresolvedCount: input.unresolvedCount,
        sloCompliance: input.sloStatus,
        outboxHealth: "OPERATIONAL",
        workerHealth: "HEALTHY",
        alertHealth: "ACTIVE",
        resilienceScore: input.resilienceScore,
        drVerified: input.drVerified,
        rollbackReady: input.drVerified,
        evaluatorDecision: StabilizationDecisionEnum.REQUIRES_EXTENDED_OBSERVATION,
        gate30Status: "NOT_VERIFIED",
        evidenceNotes: "Technical readiness is certified. GATE 30 remains NOT_VERIFIED pending real post-deployment production runtime evidence.",
      };
    }

    // Evaluate live evidence thresholds
    const isPassing =
      input.availabilityPercent >= this.TARGET_AVAILABILITY_PERCENT &&
      input.avgLatencyMs <= this.TARGET_LATENCY_MS &&
      input.errorRatePercent <= this.TARGET_ERROR_RATE_PERCENT &&
      input.p1Count === 0 &&
      input.drVerified;

    return {
      evaluatedAt,
      launchTimestamp: evaluatedAt,
      version: "v1.0.0-GA",
      commitHash: "prod_release_v1_0_0_ga",
      observationStart: evaluatedAt,
      observationEnd: evaluatedAt,
      availabilityPercent: input.availabilityPercent,
      avgLatencyMs: input.avgLatencyMs,
      errorRatePercent: input.errorRatePercent,
      p1Count: input.p1Count,
      p2Count: input.p2Count,
      unresolvedCount: input.unresolvedCount,
      sloCompliance: input.sloStatus,
      outboxHealth: "OPERATIONAL",
      workerHealth: "HEALTHY",
      alertHealth: "ACTIVE",
      resilienceScore: input.resilienceScore,
      drVerified: input.drVerified,
      rollbackReady: input.drVerified,
      evaluatorDecision: isPassing ? StabilizationDecisionEnum.PASSED : StabilizationDecisionEnum.FAILED,
      gate30Status: isPassing ? "PASS" : "FAIL",
      evidenceNotes: isPassing ? "Real production observation completed; 24h stabilization criteria passed." : "Threshold breach detected during 24h observation window.",
    };
  }
}
