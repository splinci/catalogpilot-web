/**
 * ============================================================================
 * Splinci Commerce OS — Operations Service Facade
 * ============================================================================
 * Specification Reference: M12-002 / OPS-001 / SAD-001 / ENG-001
 * Unified Operations & Production Readiness Service Facade
 * ============================================================================
 */

import { healthService } from "./operations/health.service";
import { incidentService } from "./operations/incident.service";
import { operationsMetricsService } from "./operations/operations-metrics.service";
import { outboxOperationsService } from "./operations/outbox.service";
import { systemSettingsService } from "./operations/system-settings.service";
import { notificationService } from "./operations/notification.service";
import { operationsAnalyticsService } from "./operations/operations-analytics.service";
import { sloService } from "./operations/slo.service";
import { alertDispatcherService } from "./operations/alert-dispatcher.service";
import { telemetryHistoryService } from "./operations/telemetry-history.service";
import { predictiveOperationsService } from "./operations/predictive.service";
import { resilienceOperationsService } from "./operations/resilience.service";
import { productionValidationService } from "./operations/production-validation.service";
import { backupRecoveryService } from "./operations/backup-recovery.service";
import { productionCertificationService } from "./operations/production-certification.service";
import { goLiveService } from "./operations/go-live.service";
import { stabilizationService } from "./operations/stabilization.service";
import { goLiveEvidenceService } from "./operations/go-live-evidence.service";

export class OperationsServiceFacade {
  readonly health = healthService;
  readonly incidents = incidentService;
  readonly metrics = operationsMetricsService;
  readonly outbox = outboxOperationsService;
  readonly settings = systemSettingsService;
  readonly notifications = notificationService;
  readonly analytics = operationsAnalyticsService;
  readonly slo = sloService;
  readonly alerts = alertDispatcherService;
  readonly telemetryHistory = telemetryHistoryService;
  readonly predictive = predictiveOperationsService;
  readonly resilience = resilienceOperationsService;
  readonly validation = productionValidationService;
  readonly backupRecovery = backupRecoveryService;
  readonly certification = productionCertificationService;
  readonly goLive = goLiveService;
  readonly stabilization = stabilizationService;
  readonly goLiveEvidence = goLiveEvidenceService;
}

export const operationsService = new OperationsServiceFacade();
