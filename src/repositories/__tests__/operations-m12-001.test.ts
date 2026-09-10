/**
 * ============================================================================
 * Splinci Commerce OS — Operations & Production Readiness Repository Test Suite
 * ============================================================================
 * Specification Reference: M12-001 / TEST-001 / OPS-001 / DAT-001 / SEC-001
 * Coverage: HealthRepository, OperationsMetricsRepository, IncidentRepository,
 *           OperationsRepository, Tenant Isolation, Outbox Retry & Audit Trail
 * ============================================================================
 */

import { describe, it, expect, beforeAll } from "vitest";
import { HealthRepository, healthRepository } from "../health.repository";
import { OperationsMetricsRepository, operationsMetricsRepository } from "../operations-metrics.repository";
import { IncidentRepository, incidentRepository } from "../incident.repository";
import { OperationsRepository, operationsRepository } from "../operations.repository";
import {
  SystemHealthStatusEnum,
  OutboxStatusEnum,
  IncidentSourceEnum,
  IncidentSeverityEnum,
} from "../../types/operations.dto";
import { prisma } from "../../lib/prisma";

describe("M12-001 Enterprise Operations & Production Readiness Foundation Test Suite", () => {
  const companyA = "cmp_ops_tenant_a";
  const companyB = "cmp_ops_tenant_b";
  const userId = "usr_ops_admin";

  let healthRepo: HealthRepository;
  let metricsRepo: OperationsMetricsRepository;
  let incidentRepo: IncidentRepository;
  let opsRepo: OperationsRepository;

  beforeAll(async () => {
    healthRepo = new HealthRepository();
    metricsRepo = new OperationsMetricsRepository();
    incidentRepo = new IncidentRepository();
    opsRepo = new OperationsRepository();

    // Setup seed records for tenant A and tenant B
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "OPS_A", legalName: "Ops Tenant A Legal", displayName: "Ops Tenant A" },
      update: {},
    });

    await prisma.company.upsert({
      where: { id: companyB },
      create: { id: companyB, code: "OPS_B", legalName: "Ops Tenant B Legal", displayName: "Ops Tenant B" },
      update: {},
    });

    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        companyId: companyA,
        email: "opsadmin@tenanta.com",
        passwordHash: "hashed",
        firstName: "Ops",
        lastName: "Admin",
      },
      update: {},
    });
  });

  describe("1. Repository Instantiation & Capabilities", () => {
    it("should instantiate all M12-001 repositories inheriting from BaseRepository", () => {
      expect(healthRepo).toBeDefined();
      expect(metricsRepo).toBeDefined();
      expect(incidentRepo).toBeDefined();
      expect(opsRepo).toBeDefined();

      expect(typeof healthRepo.pingDatabase).toBe("function");
      expect(typeof healthRepo.recordHealthCheck).toBe("function");
      expect(typeof healthRepo.getSystemTelemetry).toBe("function");

      expect(typeof metricsRepo.getMetricsSummary).toBe("function");

      expect(typeof incidentRepo.findIncidents).toBe("function");

      expect(typeof opsRepo.findOutboxMessages).toBe("function");
      expect(typeof opsRepo.retryOutboxMessage).toBe("function");
      expect(typeof opsRepo.getSystemSettings).toBe("function");
      expect(typeof opsRepo.upsertSystemSetting).toBe("function");
      expect(typeof opsRepo.createNotification).toBe("function");
      expect(typeof opsRepo.findNotifications).toBe("function");
    });

    it("should export singleton instances", () => {
      expect(healthRepository).toBeInstanceOf(HealthRepository);
      expect(operationsMetricsRepository).toBeInstanceOf(OperationsMetricsRepository);
      expect(incidentRepository).toBeInstanceOf(IncidentRepository);
      expect(operationsRepository).toBeInstanceOf(OperationsRepository);
    });
  });

  describe("2. Platform Health & Diagnostics (Platform-Level Scope)", () => {
    it("should ping database and return connection status and latency", async () => {
      const result = await healthRepo.pingDatabase();
      expect(result.isConnected).toBe(true);
      expect(typeof result.latencyMs).toBe("number");
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it("should record health check entry in platform health_checks table", async () => {
      const hc = await healthRepo.recordHealthCheck("OK");
      expect(hc.id).toBeDefined();
      expect(hc.status).toBe("OK");
      expect(hc.checkedAt).toBeInstanceOf(Date);
    });

    it("should retrieve recent platform health checks", async () => {
      const recent = await healthRepo.getRecentHealthChecks(5);
      expect(Array.isArray(recent)).toBe(true);
      expect(recent.length).toBeGreaterThan(0);
    });

    it("should return comprehensive system diagnostic telemetry", async () => {
      const telemetry = await healthRepo.getSystemTelemetry();
      expect([SystemHealthStatusEnum.HEALTHY, SystemHealthStatusEnum.DEGRADED]).toContain(telemetry.status);
      expect(telemetry.version).toBe("v1.0.0");
      expect(telemetry.database.status).toBe("CONNECTED");
      expect(telemetry.system.nodeVersion).toBeDefined();
      expect(telemetry.security.multiTenantIsolated).toBe(true);
    });
  });

  describe("3. Tenant Operational Metrics & Aggregates (Tenant-Scoped)", () => {
    it("should return tenant operational metrics summary scoped to companyId", async () => {
      const metricsA = await metricsRepo.getMetricsSummary(companyA);
      expect(metricsA.companyId).toBe(companyA);
      expect(typeof metricsA.outbox.totalMessages).toBe("number");
      expect(typeof metricsA.aiJobs.totalJobs).toBe("number");
      expect(typeof metricsA.workflows.totalExecutions).toBe("number");
      expect(typeof metricsA.securityAudit.totalLogs).toBe("number");
      expect(typeof metricsA.alerts.unreadCount).toBe("number");
    });
  });

  describe("4. Derived Operational Incidents & Action Gate", () => {
    it("should aggregate failed outbox messages and AI jobs into tenant incidents", async () => {
      // Seed a failed outbox message for Tenant A
      const failedOutbox = await prisma.outboxMessage.create({
        data: {
          companyId: companyA,
          eventType: "ORDER_FULFILLMENT_SYNC",
          payload: { orderId: "ord_failed_101" },
          status: "FAILED",
          retryCount: 4,
        },
      });

      const { incidents, total } = await incidentRepo.findIncidents({
        companyId: companyA,
        limit: 10,
      });

      expect(total).toBeGreaterThan(0);
      const found = incidents.find((inc) => inc.entityId === failedOutbox.id);
      expect(found).toBeDefined();
      expect(found?.source).toBe(IncidentSourceEnum.OUTBOX);
      expect(found?.severity).toBe(IncidentSeverityEnum.CRITICAL);
    });

    it("should enforce tenant isolation on incident queries", async () => {
      const { incidents: incidentsA } = await incidentRepo.findIncidents({ companyId: companyA });
      const { incidents: incidentsB } = await incidentRepo.findIncidents({ companyId: companyB });

      // Incidents for tenant A must not leak to tenant B
      for (const incA of incidentsA) {
        expect(incidentsB.some((incB) => incB.id === incA.id)).toBe(false);
      }
    });

    it("should filter incidents by source and date range", async () => {
      const startDate = new Date(Date.now() - 3600 * 1000);
      const endDate = new Date(Date.now() + 3600 * 1000);

      const { incidents } = await incidentRepo.findIncidents({
        companyId: companyA,
        source: IncidentSourceEnum.OUTBOX,
        startDate,
        endDate,
      });

      for (const inc of incidents) {
        expect(inc.source).toBe(IncidentSourceEnum.OUTBOX);
        expect(inc.occurredAt.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
      }
    });
  });

  describe("5. Outbox Queue Administration & Transactions", () => {
    it("should query tenant outbox messages with pagination", async () => {
      const result = await opsRepo.findOutboxMessages({
        companyId: companyA,
        page: 1,
        limit: 10,
      });

      expect(result.companyId).toBeUndefined(); // Returns messages, total, page, limit
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.page).toBe(1);
    });

    it("should retry failed outbox message within a transaction and log audit trail", async () => {
      const outboxMsg = await prisma.outboxMessage.create({
        data: {
          companyId: companyA,
          eventType: "INVENTORY_SYNC",
          payload: { sku: "SKU-99" },
          status: "FAILED",
          retryCount: 1,
        },
      });

      const retried = await opsRepo.retryOutboxMessage(
        { companyId: companyA, outboxId: outboxMsg.id },
        userId
      );

      expect(retried.status).toBe("PENDING");
      expect(retried.retryCount).toBe(2);
      expect(retried.nextAttemptAt).toBeInstanceOf(Date);

      // Verify audit log entry created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          companyId: companyA,
          entityName: "OutboxMessage",
          entityId: outboxMsg.id,
        },
        orderBy: { createdAt: "desc" },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog?.action).toBe("STOCK_ADJUSTED");
    });

    it("should reject retrying outbox message belonging to another tenant (Cross-Tenant Security)", async () => {
      const outboxB = await prisma.outboxMessage.create({
        data: {
          companyId: companyB,
          eventType: "TENANT_B_EVENT",
          payload: {},
          status: "FAILED",
        },
      });

      await expect(
        opsRepo.retryOutboxMessage({ companyId: companyA, outboxId: outboxB.id }, userId)
      ).rejects.toThrow("not found for tenant");
    });
  });

  describe("6. System Settings & Tenant Isolation", () => {
    it("should upsert tenant system setting and audit change", async () => {
      const setting = await opsRepo.upsertSystemSetting(
        {
          companyId: companyA,
          key: "PURCHASING_AUTO_APPROVE_THRESHOLD",
          value: "10000",
        },
        userId
      );

      expect(setting.companyId).toBe(companyA);
      expect(setting.key).toBe("PURCHASING_AUTO_APPROVE_THRESHOLD");
      expect(setting.value).toBe("10000");

      const fetched = await opsRepo.getSystemSettingByKey(companyA, "PURCHASING_AUTO_APPROVE_THRESHOLD");
      expect(fetched?.value).toBe("10000");

      // Verify cross-tenant isolation
      const fetchedB = await opsRepo.getSystemSettingByKey(companyB, "PURCHASING_AUTO_APPROVE_THRESHOLD");
      expect(fetchedB).toBeNull();
    });
  });

  describe("7. Operational Notifications & System Alerts", () => {
    it("should create, list, and mark notifications read for user", async () => {
      const notif = await opsRepo.createNotification({
        companyId: companyA,
        userId: userId,
        title: "Critical System Alert: Database Latency Spike",
        message: "Database latency exceeded 250ms threshold at 10:15 AM",
      });

      expect(notif.isRead).toBe(false);

      const unreadList = await opsRepo.findNotifications({
        companyId: companyA,
        userId: userId,
        isRead: false,
      });

      expect(unreadList.some((n) => n.id === notif.id)).toBe(true);

      await opsRepo.markNotificationRead(companyA, notif.id, userId);

      const updated = await prisma.notification.findUnique({ where: { id: notif.id } });
      expect(updated?.isRead).toBe(true);
    });
  });
});
