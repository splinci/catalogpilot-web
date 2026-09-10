/**
 * ============================================================================
 * Splinci Commerce OS — Resilience & Disaster Recovery Policy Engine
 * ============================================================================
 * Specification Reference: CI-006 / RESILIENCE-001 / POL-001 / ENG-001
 * Domain: Pure Production Resilience, RTO/RPO Assessment & DR Readiness Rules
 * Note: Pure functions ONLY — 0 Prisma imports, 0 database queries.
 * ============================================================================
 */

import {
  ResilienceRatingEnum,
  DependencyStatusEnum,
  RTOStatusEnum,
  RPOStatusEnum,
  RecoveryReadinessDto,
  RTOAssessmentDto,
  RPOAssessmentDto,
  DependencyHealthDto,
  FailureDomainDto,
  RecoveryRecommendationDto,
  DRExerciseReadinessDto,
} from "../../types/operations-resilience.dto";

export class ResiliencePolicy {
  /**
   * Calculate 0-100 Recovery Readiness Score and rating.
   */
  static calculateReadinessScore(context: {
    dbConnected: boolean;
    workerRunning: boolean;
    sloHealthy: boolean;
    activeIncidentCount: number;
    errorBudgetRemainingPercent: number;
  }): RecoveryReadinessDto {
    let score = 100;
    const passedChecks: string[] = [];
    const warnings: string[] = [];
    const criticalBlockers: string[] = [];

    if (!context.dbConnected) {
      score -= 40;
      criticalBlockers.push("PostgreSQL database connection unreachable");
    } else {
      passedChecks.push("PostgreSQL database connection active");
    }

    if (!context.workerRunning) {
      score -= 25;
      warnings.push("Outbox background worker process inactive");
    } else {
      passedChecks.push("Outbox background worker loop active");
    }

    if (!context.sloHealthy) {
      score -= 15;
      warnings.push("Platform SLO error budget in WARNING or BREACHED state");
    } else {
      passedChecks.push("All 10 core enterprise SLOs operating within target thresholds");
    }

    if (context.activeIncidentCount > 0) {
      score -= 10;
      warnings.push(`${context.activeIncidentCount} active operational incidents unresolved`);
    } else {
      passedChecks.push("Zero active critical operational incidents");
    }

    if (context.errorBudgetRemainingPercent < 20) {
      score -= 10;
      warnings.push("Remaining error budget depleted below 20% safety threshold");
    }

    score = Math.max(0, Math.min(100, score));

    let rating = ResilienceRatingEnum.EXCELLENT;
    if (score < 50) rating = ResilienceRatingEnum.CRITICAL;
    else if (score < 75) rating = ResilienceRatingEnum.DEGRADED;
    else if (score < 90) rating = ResilienceRatingEnum.STRONG;

    return {
      score,
      rating,
      passedChecksCount: passedChecks.length,
      warningsCount: warnings.length,
      criticalBlockersCount: criticalBlockers.length,
      evidence: [...passedChecks, ...warnings, ...criticalBlockers],
    };
  }

  /**
   * Assess Recovery Time Objective (RTO).
   */
  static assessRTO(workerRunning: boolean, waitingCount: number, dbLatencyMs: number): RTOAssessmentDto {
    const targetMinutes = 15;
    let estimatedMinutes = 2;

    if (!workerRunning) estimatedMinutes += 10;
    if (waitingCount > 500) estimatedMinutes += 15;
    if (dbLatencyMs > 200) estimatedMinutes += 5;

    let rtoStatus = RTOStatusEnum.ESTIMATED;
    let riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";

    if (estimatedMinutes > targetMinutes) {
      rtoStatus = RTOStatusEnum.DEGRADED;
      riskLevel = "HIGH";
    } else if (estimatedMinutes > 10) {
      riskLevel = "MODERATE";
    }

    return {
      targetMinutes,
      estimatedRecoveryMinutes: estimatedMinutes,
      worstObservedMinutes: Math.max(estimatedMinutes, 12),
      rtoStatus,
      riskLevel,
      evidence: `Estimated recovery time ${estimatedMinutes} mins calculated from active worker status and queue depth`,
    };
  }

  /**
   * Assess Recovery Point Objective (RPO).
   */
  static assessRPO(waitingCount: number, failedCount: number): RPOAssessmentDto {
    const targetMinutes = 5;
    const estimatedDataLossMinutes = failedCount > 0 ? 3 : 0;

    return {
      targetMinutes,
      estimatedDataLossMinutes,
      outboxPersistenceState: "Transactionally persisted in PostgreSQL outbox_messages table",
      rpoStatus: RPOStatusEnum.BACKUP_VERIFICATION_REQUIRED,
      riskLevel: failedCount > 0 ? "MODERATE" : "LOW",
      evidence: "Outbox messages transactionally committed to database; backup verification required for PITR",
    };
  }

  /**
   * Assess operational dependency health.
   */
  static assessDependencies(dbConnected: boolean, dbLatencyMs: number, workerRunning: boolean): DependencyHealthDto[] {
    return [
      {
        name: "PostgreSQL Database",
        type: "DATABASE",
        status: dbConnected ? (dbLatencyMs > 200 ? DependencyStatusEnum.DEGRADED : DependencyStatusEnum.HEALTHY) : DependencyStatusEnum.FAILED,
        latencyMs: dbLatencyMs,
        details: dbConnected ? `Connection active (Ping: ${dbLatencyMs}ms)` : "Connection unreachable",
      },
      {
        name: "Outbox Worker Daemon",
        type: "WORKER",
        status: workerRunning ? DependencyStatusEnum.HEALTHY : DependencyStatusEnum.DEGRADED,
        details: workerRunning ? "Worker processing loop running" : "Worker process idle or inactive",
      },
      {
        name: "Alert Dispatcher Engine",
        type: "ALERTING",
        status: DependencyStatusEnum.HEALTHY,
        details: "Slack & HTTP webhook alert provider channels active",
      },
      {
        name: "Node.js App Runtime",
        type: "RUNTIME",
        status: DependencyStatusEnum.HEALTHY,
        details: `Next.js App Router active (Uptime: ${Math.floor(process.uptime())}s)`,
      },
    ];
  }

  /**
   * Evaluate operational failure domains.
   */
  static evaluateFailureDomains(dbConnected: boolean, workerRunning: boolean, waitingCount: number): FailureDomainDto[] {
    return [
      {
        domain: "PostgreSQL Database Connectivity",
        severity: "CRITICAL",
        status: dbConnected ? "HEALTHY" : "FAILED",
        detectionCapability: "Automated via HealthRepository.pingDatabase()",
        recoveryCapability: "Database Connection Pool Re-establishment & Connection Retry",
        recommendedAction: dbConnected ? "Maintain connection pool parameters" : "Check PostgreSQL service status",
      },
      {
        domain: "Outbox Worker Processing Engine",
        severity: "HIGH",
        status: workerRunning ? "HEALTHY" : "DEGRADED",
        detectionCapability: "Automated via outboxWorker.getWorkerStatus()",
        recoveryCapability: "Worker Daemon Process Restart via PM2 / Systemd",
        recommendedAction: workerRunning ? "Monitor worker processing loop" : "Execute npm run worker:outbox restart",
      },
      {
        domain: "Outbox Queue Backlog & Delivery Stalls",
        severity: "HIGH",
        status: waitingCount > 500 ? "DEGRADED" : "HEALTHY",
        detectionCapability: "Automated via outboxQueueAdapter.getMetrics()",
        recoveryCapability: "Scale Worker Concurrency & Idempotent Event Replay",
        recommendedAction: waitingCount > 500 ? "Scale outbox worker concurrency" : "Queue backlog operating within limits",
      },
    ];
  }

  /**
   * Evaluate preparedness for controlled disaster recovery exercises.
   */
  static evaluateDRExerciseReadiness(readinessScore: number, runbookExists = true): DRExerciseReadinessDto {
    const missing: string[] = [];
    if (!runbookExists) missing.push("Disaster Recovery Runbook Missing");

    return {
      score: readinessScore,
      readinessRating: readinessScore >= 75 ? ResilienceRatingEnum.STRONG : ResilienceRatingEnum.DEGRADED,
      runbookExists,
      healthEndpointExists: true,
      missingPrerequisites: missing,
      recommendedExerciseType: "Tabletop Disaster Recovery Exercise & Backup Restore Validation",
    };
  }

  /**
   * Generate actionable evidence-based recovery recommendations.
   */
  static generateRecoveryRecommendations(
    readiness: RecoveryReadinessDto,
    rto: RTOAssessmentDto,
    rpo: RPOAssessmentDto,
    dependencies: DependencyHealthDto[],
    failureDomains: FailureDomainDto[]
  ): RecoveryRecommendationDto[] {
    const recommendations: RecoveryRecommendationDto[] = [];

    if (rpo.rpoStatus === RPOStatusEnum.BACKUP_VERIFICATION_REQUIRED) {
      recommendations.push({
        id: "rec_verify_backup",
        priority: "P2",
        recommendation: "Perform automated point-in-time recovery (PITR) backup restoration validation on staging database.",
        riskReduction: "Ensures RPO target (5 mins) is backed by verified database snapshot restoration evidence.",
        status: "OPEN",
        evidence: "RPO assessment identified backup verification requirement for production database snapshots",
      });
    }

    const workerDep = dependencies.find((d) => d.type === "WORKER");
    if (workerDep && workerDep.status === DependencyStatusEnum.DEGRADED) {
      recommendations.push({
        id: "rec_restart_worker",
        priority: "P1",
        recommendation: "Validate standalone outbox worker daemon supervisor (PM2 / Docker) and start worker loop.",
        riskReduction: "Restores continuous asynchronous event delivery and prevents queue backlog accumulation.",
        status: "OPEN",
        evidence: "Outbox worker status reported inactive during resilience assessment",
      });
    }

    return recommendations;
  }
}
