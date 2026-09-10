/**
 * ============================================================================
 * Splinci Commerce OS — CI-003 Alert Dispatcher Test Suite
 * ============================================================================
 * Specification Reference: CI-003 / TEST-003 / ALERT-001 / SEC-001
 * Coverage: AlertPolicy, AlertDispatcherService, Deduplication & Provider Safety
 * ============================================================================
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { prisma } from "../../../lib/prisma";
import { AlertPolicy } from "../alert.policy";
import { AlertDispatcherService } from "../alert-dispatcher.service";
import {
  AlertSeverityEnum,
  AlertSourceEnum,
  AlertStatusEnum,
  AlertEventDto,
} from "../../../types/operations-alert.dto";

describe("CI-003 Enterprise Automated Alert Dispatcher Test Suite", () => {
  const companyA = "cmp_ci_tenant_a";
  let dispatcher: AlertDispatcherService;

  beforeAll(async () => {
    await prisma.company.upsert({
      where: { id: companyA },
      create: { id: companyA, code: "CI_ALERT_TENANT_A", legalName: "CI Alert Tenant A Legal", displayName: "CI Alert Tenant A" },
      update: {},
    });
  });

  beforeEach(() => {
    dispatcher = new AlertDispatcherService();
    dispatcher.clearDeduplicationCache();
  });

  describe("1. AlertPolicy Rules", () => {
    it("should classify database disconnect and security failures as P1_CRITICAL", () => {
      const p1Db = AlertPolicy.determineAlertSeverity(AlertSourceEnum.DATABASE, { isDatabaseDisconnected: true });
      expect(p1Db).toBe(AlertSeverityEnum.P1_CRITICAL);

      const p1Sec = AlertPolicy.determineAlertSeverity(AlertSourceEnum.SECURITY, { isSecurityFailure: true });
      expect(p1Sec).toBe(AlertSeverityEnum.P1_CRITICAL);
    });

    it("should generate deterministic deduplication key for tenant and platform scope", () => {
      const keyTenant = AlertPolicy.calculateDeduplicationKey({
        companyId: companyA,
        source: AlertSourceEnum.OUTBOX,
        eventType: "QUEUE_BACKLOG",
        severity: AlertSeverityEnum.P2_HIGH,
      });
      expect(keyTenant).toBe(`tenant:${companyA}:OUTBOX:QUEUE_BACKLOG:P2_HIGH`);

      const keyPlatform = AlertPolicy.calculateDeduplicationKey({
        source: AlertSourceEnum.DATABASE,
        eventType: "DB_DOWN",
        severity: AlertSeverityEnum.P1_CRITICAL,
      });
      expect(keyPlatform).toBe("platform:DATABASE:DB_DOWN:P1_CRITICAL");
    });

    it("should sanitize sensitive credentials in alert metadata", () => {
      const rawMetadata = {
        entityId: "ent_123",
        secretToken: "sk_live_99999",
        dbPassword: "supersecretpass",
        retryCount: 3,
      };

      const sanitized = AlertPolicy.sanitizeMetadata(rawMetadata);
      expect(sanitized.entityId).toBe("ent_123");
      expect(sanitized.secretToken).toBe("[REDACTED]");
      expect(sanitized.dbPassword).toBe("[REDACTED]");
      expect(sanitized.retryCount).toBe(3);
    });
  });

  describe("2. Alert Dispatcher Execution & Deduplication", () => {
    it("should dispatch P1 Critical alert and update telemetry history", async () => {
      const event: AlertEventDto = {
        severity: AlertSeverityEnum.P1_CRITICAL,
        source: AlertSourceEnum.DATABASE,
        eventType: "DB_DISCONNECT",
        title: "PostgreSQL Database Connection Lost",
        message: "Database ping failed to resolve",
        companyId: companyA,
      };

      const result = await dispatcher.dispatchAlert(event);
      expect(result.status).toBe(AlertStatusEnum.DISPATCHED);
      expect(result.deduplicated).toBe(false);

      const summary = await dispatcher.getDispatchSummary();
      expect(summary.total).toBe(1);
      expect(summary.dispatched).toBe(1);
    });

    it("should enforce Deduplication: suppress duplicate alert event within window", async () => {
      const event: AlertEventDto = {
        severity: AlertSeverityEnum.P2_HIGH,
        source: AlertSourceEnum.OUTBOX,
        eventType: "WORKER_STALLED",
        title: "Outbox Worker Processing Lag",
        message: "Queue depth exceeded threshold",
        companyId: companyA,
      };

      const firstDispatch = await dispatcher.dispatchAlert(event);
      expect(firstDispatch.status).toBe(AlertStatusEnum.DISPATCHED);

      const duplicateDispatch = await dispatcher.dispatchAlert(event);
      expect(duplicateDispatch.status).toBe(AlertStatusEnum.SUPPRESSED);
      expect(duplicateDispatch.deduplicated).toBe(true);

      const summary = await dispatcher.getDispatchSummary();
      expect(summary.total).toBe(2);
      expect(summary.dispatched).toBe(1);
      expect(summary.suppressed).toBe(1);
    });
  });
});
