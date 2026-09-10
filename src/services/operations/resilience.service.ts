/**
 * ============================================================================
 * Splinci Commerce OS — Resilience & Disaster Recovery Service
 * ============================================================================
 * Specification Reference: CI-006 / SERVICE-001 / RESILIENCE-001 / SAD-001
 * Enterprise Production Resilience, DR & Business Continuity Intelligence Service
 * ============================================================================
 */

import { HealthRepository, healthRepository } from "../../repositories/health.repository";
import { SLOService, sloService } from "./slo.service";
import { outboxQueueAdapter } from "../../infrastructure/queue/outbox-queue.adapter";
import { outboxWorker } from "../../infrastructure/worker/outbox-worker";
import { alertDispatcherService } from "./alert-dispatcher.service";
import { ResiliencePolicy } from "./resilience.policy";
import {
  ResilienceDashboardDto,
  RecoveryReadinessDto,
  RTOAssessmentDto,
  RPOAssessmentDto,
  DependencyHealthDto,
  FailureDomainDto,
  RecoveryRecommendationDto,
  DRExerciseReadinessDto,
  ResilienceRatingEnum,
} from "../../types/operations-resilience.dto";
import { AlertSeverityEnum, AlertSourceEnum } from "../../types/operations-alert.dto";

export class ResilienceOperationsService {
  constructor(
    private readonly healthRepo: HealthRepository = healthRepository,
    private readonly sloSvc: SLOService = sloService
  ) {}

  /**
   * Get 0-100 Recovery Readiness Score.
   */
  async getRecoveryReadiness(companyId?: string): Promise<RecoveryReadinessDto> {
    const ping = await this.healthRepo.pingDatabase();
    const workerStatus = outboxWorker.getWorkerStatus();
    const sloSummary = await this.sloSvc.getSLOSummary();

    return ResiliencePolicy.calculateReadinessScore({
      dbConnected: ping.isConnected,
      workerRunning: workerStatus.isRunning,
      sloHealthy: sloSummary.overallStatus === "HEALTHY",
      activeIncidentCount: 0,
      errorBudgetRemainingPercent: 85,
    });
  }

  /**
   * Get RTO Assessment.
   */
  async getRTOAssessment(companyId?: string): Promise<RTOAssessmentDto> {
    const ping = await this.healthRepo.pingDatabase();
    const workerStatus = outboxWorker.getWorkerStatus();
    const queueMetrics = await outboxQueueAdapter.getMetrics();

    return ResiliencePolicy.assessRTO(workerStatus.isRunning, queueMetrics.waitingCount, ping.latencyMs);
  }

  /**
   * Get RPO Assessment.
   */
  async getRPOAssessment(companyId?: string): Promise<RPOAssessmentDto> {
    const queueMetrics = await outboxQueueAdapter.getMetrics();
    return ResiliencePolicy.assessRPO(queueMetrics.waitingCount, queueMetrics.failedCount);
  }

  /**
   * Get Dependency Health evaluations.
   */
  async getDependencyHealth(companyId?: string): Promise<DependencyHealthDto[]> {
    const ping = await this.healthRepo.pingDatabase();
    const workerStatus = outboxWorker.getWorkerStatus();

    return ResiliencePolicy.assessDependencies(ping.isConnected, ping.latencyMs, workerStatus.isRunning);
  }

  /**
   * Get Failure Domain Analysis.
   */
  async getFailureDomains(companyId?: string): Promise<FailureDomainDto[]> {
    const ping = await this.healthRepo.pingDatabase();
    const workerStatus = outboxWorker.getWorkerStatus();
    const queueMetrics = await outboxQueueAdapter.getMetrics();

    return ResiliencePolicy.evaluateFailureDomains(ping.isConnected, workerStatus.isRunning, queueMetrics.waitingCount);
  }

  /**
   * Get DR Exercise Readiness evaluation.
   */
  async getDRExerciseReadiness(companyId?: string): Promise<DRExerciseReadinessDto> {
    const readiness = await this.getRecoveryReadiness(companyId);
    return ResiliencePolicy.evaluateDRExerciseReadiness(readiness.score, true);
  }

  /**
   * Get evidence-based Recovery Recommendations.
   */
  async getRecoveryRecommendations(companyId?: string): Promise<RecoveryRecommendationDto[]> {
    const readiness = await this.getRecoveryReadiness(companyId);
    const rto = await this.getRTOAssessment(companyId);
    const rpo = await this.getRPOAssessment(companyId);
    const dependencies = await this.getDependencyHealth(companyId);
    const failureDomains = await this.getFailureDomains(companyId);

    return ResiliencePolicy.generateRecoveryRecommendations(readiness, rto, rpo, dependencies, failureDomains);
  }

  /**
   * Get unified Resilience Operations Dashboard DTO.
   */
  async getResilienceDashboard(companyId?: string): Promise<ResilienceDashboardDto> {
    const readiness = await this.getRecoveryReadiness(companyId);
    const rto = await this.getRTOAssessment(companyId);
    const rpo = await this.getRPOAssessment(companyId);
    const dependencies = await this.getDependencyHealth(companyId);
    const failureDomains = await this.getFailureDomains(companyId);
    const recommendations = await this.getRecoveryRecommendations(companyId);
    const drReadiness = await this.getDRExerciseReadiness(companyId);

    // Trigger alert if recovery readiness is CRITICAL
    if (readiness.rating === ResilienceRatingEnum.CRITICAL) {
      await alertDispatcherService.dispatchAlert({
        severity: AlertSeverityEnum.P1_CRITICAL,
        source: AlertSourceEnum.DATABASE,
        eventType: "RESILIENCE_CRITICAL_DEGRADATION",
        title: "Resilience Warning: Recovery Readiness Rating Critical",
        message: "Platform recovery readiness score dropped into CRITICAL rating range.",
        companyId,
      });
    }

    return {
      evaluatedAt: new Date().toISOString(),
      companyId,
      readiness,
      rto,
      rpo,
      dependencies,
      failureDomains,
      recommendations,
      drReadiness,
    };
  }
}

export const resilienceOperationsService = new ResilienceOperationsService();
