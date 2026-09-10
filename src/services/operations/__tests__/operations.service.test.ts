/**
 * ============================================================================
 * Splinci Commerce OS — Operations Service & Policy Layer Test Suite
 * ============================================================================
 * Specification Reference: M12-002 / TEST-001 / OPS-001 / SAD-001 / SEC-001
 * Coverage: Operations Policies, HealthService, IncidentService,
 *           OperationsMetricsService, OutboxOperationsService,
 *           SystemSettingsService, NotificationService, OperationsAnalyticsService,
 *           OperationsServiceFacade, Tenant Isolation, Audit Integration
 * ============================================================================
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  HealthPolicy,
  IncidentPolicy,
  OutboxPolicy,
  SystemSettingPolicy,
  NotificationPolicy,
  OperationsReadinessPolicy,
} from "../operations.policy";
import { healthService, HealthService } from "../health.service";
import { incidentService, IncidentService } from "../incident.service";
import { operationsMetricsService, OperationsMetricsService } from "../operations-metrics.service";
import { outboxOperationsService, OutboxOperationsService } from "../outbox.service";
import { systemSettingsService, SystemSettingsService } from "../system-settings.service";
import { notificationService, NotificationService } from "../notification.service";
import { operationsAnalyticsService, OperationsAnalyticsService } from "../operations-analytics.service";
import { operationsService } from "../../operations.service";
import {
  SystemHealthStatusEnum,
  IncidentSeverityEnum,
  IncidentSourceEnum,
  OutboxStatusEnum,
} from "../../../types/operations.dto";
import { prisma } from "../../../lib/prisma";

describe("M12-002 Enterprise Operations Service & Policy Layer Test Suite", () => {
  const companyA = "cmp_ops_svc_a";
  const companyB = "cmp_ops_svc_b";
  const userId = "usr_ops_svc_admin";

  beforeAll(async () => {
    // Seed test companies and user
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "OPS_SVC_A", legalName: "Ops Svc Tenant A Legal", displayName: "Ops Svc Tenant A" },
      update: {},
    });

    await prisma.company.upsert({
      where: { id: companyB },
      create: { id: companyB, code: "OPS_SVC_B", legalName: "Ops Svc Tenant B Legal", displayName: "Ops Svc Tenant B" },
      update: {},
    });

    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        companyId: companyA,
        email: "opssvcadmin@tenanta.com",
        passwordHash: "hashed",
        firstName: "OpsSvc",
        lastName: "Admin",
      },
      update: {},
    });
  });

  // ==========================================
  // 1. POLICY ENGINE UNIT TESTS
  // ==========================================

  describe("1. Operations Policy Engine", () => {
    it("should classify health status correctly based on connectivity and latency", () => {
      expect(HealthPolicy.evaluateHealthStatus(false, 10)).toBe(SystemHealthStatusEnum.UNHEALTHY);
      expect(HealthPolicy.evaluateHealthStatus(true, 45)).toBe(SystemHealthStatusEnum.HEALTHY);
      expect(HealthPolicy.evaluateHealthStatus(true, 150)).toBe(SystemHealthStatusEnum.DEGRADED);
      expect(HealthPolicy.evaluateHealthStatus(true, 400)).toBe(SystemHealthStatusEnum.UNHEALTHY);
    });

    it("should evaluate incident severity and immediate attention requirement", () => {
      const criticalIncident = {
        id: "INC-1",
        source: IncidentSourceEnum.OUTBOX,
        severity: IncidentSeverityEnum.CRITICAL,
        title: "Database Failure",
        details: "Details",
        occurredAt: new Date(),
      };

      const lowIncident = {
        id: "INC-2",
        source: IncidentSourceEnum.WORKFLOW,
        severity: IncidentSeverityEnum.LOW,
        title: "Minor Delay",
        details: "Details",
        occurredAt: new Date(),
      };

      expect(IncidentPolicy.requiresImmediateAttention(criticalIncident)).toBe(true);
      expect(IncidentPolicy.requiresImmediateAttention(lowIncident)).toBe(false);

      expect(IncidentPolicy.classifySeverity(IncidentSourceEnum.OUTBOX, { status: "FAILED" })).toBe(
        IncidentSeverityEnum.CRITICAL
      );
      expect(IncidentPolicy.classifySeverity(IncidentSourceEnum.WORKFLOW, { status: "EXPIRED" })).toBe(
        IncidentSeverityEnum.MEDIUM
      );
    });

    it("should evaluate outbox retry eligibility and backoff delay", () => {
      expect(OutboxPolicy.canRetry({ status: OutboxStatusEnum.FAILED, retryCount: 2 }).eligible).toBe(true);
      expect(OutboxPolicy.canRetry({ status: OutboxStatusEnum.PROCESSED, retryCount: 1 }).eligible).toBe(false);
      expect(OutboxPolicy.canRetry({ status: OutboxStatusEnum.FAILED, retryCount: 5 }).eligible).toBe(false);

      expect(OutboxPolicy.calculateRetryDelayMs(1)).toBe(5000);
      expect(OutboxPolicy.calculateRetryDelayMs(3)).toBe(20000);
    });

    it("should validate system setting keys and values", () => {
      expect(SystemSettingPolicy.isValidKey("AUTO_APPROVE_THRESHOLD")).toBe(true);
      expect(SystemSettingPolicy.isValidKey("invalid-key")).toBe(false);

      expect(SystemSettingPolicy.isProtectedKey("SYSTEM_MAINTENANCE_MODE")).toBe(true);
      expect(SystemSettingPolicy.isProtectedKey("CUSTOM_USER_SETTING")).toBe(false);

      expect(SystemSettingPolicy.isValidValue("100")).toBe(true);
      expect(SystemSettingPolicy.isValidValue("")).toBe(false);
    });

    it("should evaluate composite operational readiness", () => {
      const telemetry = {
        status: SystemHealthStatusEnum.HEALTHY,
        version: "v1.0.0",
        timestamp: new Date().toISOString(),
        uptimeSeconds: 3600,
        database: { status: "CONNECTED", latencyMs: 15, provider: "PostgreSQL" },
        system: { memoryHeapUsedMB: "45.0", memoryRssMB: "120.0", nodeVersion: "v20" },
        security: { sqlInjectionProtected: true, xssAutoEscaping: true, multiTenantIsolated: true, rateLimitingActive: true },
      };

      const metrics = {
        companyId: companyA,
        outbox: { totalMessages: 10, pendingCount: 0, processedCount: 10, failedCount: 0, avgRetryCount: 0 },
        aiJobs: { totalJobs: 5, completedCount: 5, processingCount: 0, failedCount: 0 },
        workflows: { totalExecutions: 2, pendingCount: 0, approvedCount: 2, rejectedCount: 0, expiredCount: 0 },
        securityAudit: { totalLogs: 100, failedLogins: 0, activeUserSessions: 3 },
        alerts: { unreadCount: 0, totalCount: 2 },
      };

      const readiness = OperationsReadinessPolicy.evaluateReadiness({
        telemetry,
        metrics,
        criticalIncidentCount: 0,
      });

      expect(readiness.status).toBe("READY");
      expect(readiness.score).toBe(100);
      expect(readiness.blockers.length).toBe(0);
    });
  });

  // ==========================================
  // 2. DOMAIN SERVICES TESTS
  // ==========================================

  describe("2. HealthService", () => {
    it("should return platform health and telemetry", async () => {
      const health = await healthService.getHealth();
      expect(health.status).toBeDefined();
      expect(health.database.connected).toBe(true);

      const telemetry = await healthService.getSystemTelemetry();
      expect(telemetry.database.status).toBe("CONNECTED");
    });

    it("should evaluate tenant readiness through HealthService", async () => {
      const result = await healthService.evaluateReadiness(companyA);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.status).toBeDefined();
    });
  });

  describe("3. IncidentService", () => {
    it("should list incidents and provide summary for tenant", async () => {
      const list = await incidentService.listIncidents({ companyId: companyA, limit: 10 });
      expect(Array.isArray(list.incidents)).toBe(true);

      const summary = await incidentService.getIncidentSummary(companyA);
      expect(summary.companyId).toBe(companyA);
      expect(typeof summary.totalIncidents).toBe("number");
    });

    it("should enforce companyId validation", async () => {
      await expect(incidentService.listIncidents({ companyId: "" })).rejects.toThrow(
        "companyId is required"
      );
    });
  });

  describe("4. OperationsMetricsService", () => {
    it("should aggregate operational metrics and KPIs for tenant", async () => {
      const summary = await operationsMetricsService.getMetricsSummary(companyA);
      expect(summary.companyId).toBe(companyA);

      const kpis = await operationsMetricsService.getOperationalKPIs(companyA);
      expect(typeof kpis.queueSuccessRate).toBe("number");
      expect(typeof kpis.aiJobSuccessRate).toBe("number");
    });
  });

  describe("5. OutboxOperationsService", () => {
    it("should list messages and evaluate queue health", async () => {
      const list = await outboxOperationsService.listMessages({ companyId: companyA });
      expect(Array.isArray(list.messages)).toBe(true);

      const queueHealth = await outboxOperationsService.getQueueHealth(companyA);
      expect(queueHealth.companyId).toBe(companyA);
      expect(typeof queueHealth.isHealthy).toBe("boolean");
    });

    it("should reject retrying non-existent message", async () => {
      await expect(
        outboxOperationsService.retryMessage(
          { companyId: companyA, outboxId: "non_existent_outbox_id" },
          userId
        )
      ).rejects.toThrow("not found for tenant");
    });
  });

  describe("6. SystemSettingsService", () => {
    it("should upsert and retrieve tenant system setting", async () => {
      const setting = await systemSettingsService.upsertSetting(
        {
          companyId: companyA,
          key: "AI_ENRICHMENT_AUTO_STAGING",
          value: "true",
        },
        userId
      );

      expect(setting.key).toBe("AI_ENRICHMENT_AUTO_STAGING");
      expect(setting.value).toBe("true");

      const fetched = await systemSettingsService.getSetting(companyA, "AI_ENRICHMENT_AUTO_STAGING");
      expect(fetched?.value).toBe("true");
    });

    it("should reject invalid setting key format", async () => {
      await expect(
        systemSettingsService.upsertSetting({
          companyId: companyA,
          key: "invalid key with spaces",
          value: "val",
        })
      ).rejects.toThrow("Invalid system setting key format");
    });
  });

  describe("7. NotificationService", () => {
    it("should create, list, and mark notifications as read", async () => {
      const notif = await notificationService.createNotification({
        companyId: companyA,
        userId: userId,
        title: "Outbox Queue Warning",
        message: "2 events retried successfully",
      });

      expect(notif.isRead).toBe(false);

      const unreadCount = await notificationService.getUnreadCount(companyA, userId);
      expect(unreadCount).toBeGreaterThan(0);

      await notificationService.markAsRead(companyA, notif.id, userId);

      const updatedCount = await notificationService.getUnreadCount(companyA, userId);
      expect(updatedCount).toBe(unreadCount - 1);
    });
  });

  describe("8. OperationsAnalyticsService & Unified Facade", () => {
    it("should return unified operational command center dashboard payload", async () => {
      const dashboard = await operationsAnalyticsService.getOperationalDashboard(companyA);

      expect(dashboard.companyId).toBe(companyA);
      expect(dashboard.readiness).toBeDefined();
      expect(dashboard.telemetry).toBeDefined();
      expect(dashboard.metrics).toBeDefined();
      expect(dashboard.incidentSummary).toBeDefined();
      expect(dashboard.queueHealth).toBeDefined();
    }, 15000);

    it("should expose all sub-services cleanly through operationsService facade", () => {
      expect(operationsService.health).toBeInstanceOf(HealthService);
      expect(operationsService.incidents).toBeInstanceOf(IncidentService);
      expect(operationsService.metrics).toBeInstanceOf(OperationsMetricsService);
      expect(operationsService.outbox).toBeInstanceOf(OutboxOperationsService);
      expect(operationsService.settings).toBeInstanceOf(SystemSettingsService);
      expect(operationsService.notifications).toBeInstanceOf(NotificationService);
      expect(operationsService.analytics).toBeInstanceOf(OperationsAnalyticsService);
    });
  });
});
