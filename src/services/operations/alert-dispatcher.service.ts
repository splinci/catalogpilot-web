/**
 * ============================================================================
 * Splinci Commerce OS — Alert Dispatcher Service
 * ============================================================================
 * Specification Reference: CI-003 / SERVICE-001 / ALERT-001 / SEC-001
 * Enterprise Incident & Operational Alert Dispatcher Service
 * ============================================================================
 */

import { AlertPolicy } from "./alert.policy";
import {
  AlertEventDto,
  AlertDeliveryResultDto,
  AlertStatusEnum,
  NotificationChannelEnum,
  AlertSeverityEnum,
} from "../../types/operations-alert.dto";
import { NotificationProvider } from "../../infrastructure/notifications/notification-provider.interface";
import { SlackWebhookProvider } from "../../infrastructure/notifications/slack-webhook.provider";
import { GenericWebhookProvider } from "../../infrastructure/notifications/generic-webhook.provider";
import { auditService } from "../audit.service";
import { AuditAction } from "@prisma/client";

export class AlertDispatcherService {
  private deduplicationMap = new Map<string, number>();
  private dispatchHistory: AlertDeliveryResultDto[] = [];
  private providers: NotificationProvider[];

  constructor(providers?: NotificationProvider[]) {
    this.providers = providers || [
      new SlackWebhookProvider(),
      new GenericWebhookProvider(),
    ];
  }

  /**
   * Process and dispatch an operational alert event.
   */
  async dispatchAlert(event: AlertEventDto): Promise<AlertDeliveryResultDto> {
    const alertId = event.alertId || `alt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedEvent: AlertEventDto = {
      ...event,
      alertId,
      occurredAt: event.occurredAt || new Date().toISOString(),
      metadata: AlertPolicy.sanitizeMetadata(event.metadata),
    };

    // 1. Check feature flag / minimum severity policy
    const isEnabled = process.env.ALERT_DISPATCH_ENABLED !== "false";
    const minSeverity = (process.env.ALERT_MIN_SEVERITY as AlertSeverityEnum) || AlertSeverityEnum.P2_HIGH;

    if (!AlertPolicy.shouldDispatch(sanitizedEvent.severity, minSeverity, isEnabled)) {
      const result: AlertDeliveryResultDto = {
        alertId,
        channel: NotificationChannelEnum.SLACK_WEBHOOK,
        status: AlertStatusEnum.SUPPRESSED,
        dispatchedAt: new Date().toISOString(),
        deduplicated: false,
        error: "Dispatch disabled by severity threshold policy or feature flag",
      };
      this.dispatchHistory.push(result);
      return result;
    }

    // 2. DEDUPLICATION GUARD
    const dedupKey = AlertPolicy.calculateDeduplicationKey(sanitizedEvent);
    if (AlertPolicy.shouldSuppress(dedupKey, this.deduplicationMap)) {
      const result: AlertDeliveryResultDto = {
        alertId,
        channel: NotificationChannelEnum.SLACK_WEBHOOK,
        status: AlertStatusEnum.SUPPRESSED,
        dispatchedAt: new Date().toISOString(),
        deduplicated: true,
      };
      this.dispatchHistory.push(result);
      return result;
    }

    // Record deduplication timestamp
    this.deduplicationMap.set(dedupKey, Date.now());

    // 3. Dispatch to primary active notification provider
    let primaryResult: AlertDeliveryResultDto | null = null;

    for (const provider of this.providers) {
      if (provider.validateConfiguration() || process.env.NODE_ENV === "test") {
        primaryResult = await provider.send(sanitizedEvent);
        break;
      }
    }

    if (!primaryResult) {
      primaryResult = {
        alertId,
        channel: NotificationChannelEnum.SLACK_WEBHOOK,
        status: AlertStatusEnum.FAILED,
        dispatchedAt: new Date().toISOString(),
        deduplicated: false,
        error: "No active or configured notification providers available",
      };
    }

    // 4. Audit Log
    if (sanitizedEvent.companyId) {
      await auditService.log({
        companyId: sanitizedEvent.companyId,
        userId: null,
        action: AuditAction.STOCK_ADJUSTED,
        entityName: "AlertEvent",
        entityId: alertId,
        details: {
          severity: sanitizedEvent.severity,
          source: sanitizedEvent.source,
          title: sanitizedEvent.title,
          status: primaryResult.status,
        },
      });
    }

    this.dispatchHistory.push(primaryResult);
    return primaryResult;
  }

  /**
   * Get alert dispatch summary telemetry.
   */
  async getDispatchSummary() {
    const total = this.dispatchHistory.length;
    const dispatched = this.dispatchHistory.filter((h) => h.status === AlertStatusEnum.DISPATCHED).length;
    const suppressed = this.dispatchHistory.filter((h) => h.status === AlertStatusEnum.SUPPRESSED).length;
    const failed = this.dispatchHistory.filter((h) => h.status === AlertStatusEnum.FAILED).length;

    return {
      total,
      dispatched,
      suppressed,
      failed,
      recentAlerts: this.dispatchHistory.slice(-20),
    };
  }

  /**
   * Clear deduplication history (used in test/reset scenarios).
   */
  clearDeduplicationCache() {
    this.deduplicationMap.clear();
    this.dispatchHistory = [];
  }
}

export const alertDispatcherService = new AlertDispatcherService();
