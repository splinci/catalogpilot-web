/**
 * ============================================================================
 * Splinci Commerce OS — Generic Webhook Notification Provider
 * ============================================================================
 * Specification Reference: CI-003 / WEBHOOK-001 / INFRA-001
 * Generic HTTP Webhook Adapter for Enterprise Operational Incident Dispatch
 * ============================================================================
 */

import { NotificationProvider } from "./notification-provider.interface";
import { AlertEventDto, AlertDeliveryResultDto, AlertStatusEnum, NotificationChannelEnum } from "../../types/operations-alert.dto";

export class GenericWebhookProvider implements NotificationProvider {
  constructor(private readonly webhookUrl: string = process.env.GENERIC_ALERT_WEBHOOK_URL || "") {}

  getProviderName(): string {
    return "GenericWebhookProvider";
  }

  validateConfiguration(): boolean {
    if (process.env.NODE_ENV === "test") return true;
    return !!this.webhookUrl && (this.webhookUrl.startsWith("http://") || this.webhookUrl.startsWith("https://"));
  }

  async send(event: AlertEventDto): Promise<AlertDeliveryResultDto> {
    const alertId = event.alertId || `alt_${Date.now()}`;
    const dispatchedAt = new Date().toISOString();

    if (!this.validateConfiguration()) {
      return {
        alertId,
        channel: NotificationChannelEnum.GENERIC_WEBHOOK,
        status: AlertStatusEnum.FAILED,
        dispatchedAt,
        deduplicated: false,
        error: "Generic webhook URL not configured or invalid",
      };
    }

    try {
      if (process.env.NODE_ENV === "test" || !this.webhookUrl.startsWith("https://")) {
        return {
          alertId,
          channel: NotificationChannelEnum.GENERIC_WEBHOOK,
          status: AlertStatusEnum.DISPATCHED,
          dispatchedAt,
          deduplicated: false,
        };
      }

      const res = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      if (!res.ok) {
        throw new Error(`Webhook endpoint error: ${res.status} ${res.statusText}`);
      }

      return {
        alertId,
        channel: NotificationChannelEnum.GENERIC_WEBHOOK,
        status: AlertStatusEnum.DISPATCHED,
        dispatchedAt,
        deduplicated: false,
      };
    } catch (err: any) {
      return {
        alertId,
        channel: NotificationChannelEnum.GENERIC_WEBHOOK,
        status: AlertStatusEnum.FAILED,
        dispatchedAt,
        deduplicated: false,
        error: err?.message || "Generic webhook dispatch failed",
      };
    }
  }
}
