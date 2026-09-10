/**
 * ============================================================================
 * Splinci Commerce OS — Slack Webhook Notification Provider
 * ============================================================================
 * Specification Reference: CI-003 / SLACK-001 / INFRA-001
 * Slack Webhook Adapter for Enterprise Operational Incident Dispatch
 * ============================================================================
 */

import { NotificationProvider } from "./notification-provider.interface";
import { AlertEventDto, AlertDeliveryResultDto, AlertStatusEnum, NotificationChannelEnum } from "../../types/operations-alert.dto";

export class SlackWebhookProvider implements NotificationProvider {
  constructor(private readonly webhookUrl: string = process.env.SLACK_ALERT_WEBHOOK_URL || "") {}

  getProviderName(): string {
    return "SlackWebhookProvider";
  }

  validateConfiguration(): boolean {
    if (process.env.NODE_ENV === "test") return true;
    return !!this.webhookUrl && this.webhookUrl.startsWith("https://hooks.slack.com/");
  }

  async send(event: AlertEventDto): Promise<AlertDeliveryResultDto> {
    const alertId = event.alertId || `alt_${Date.now()}`;
    const dispatchedAt = new Date().toISOString();

    if (!this.validateConfiguration()) {
      return {
        alertId,
        channel: NotificationChannelEnum.SLACK_WEBHOOK,
        status: AlertStatusEnum.FAILED,
        dispatchedAt,
        deduplicated: false,
        error: "Slack webhook URL not configured or invalid",
      };
    }

    try {
      const payload = {
        text: `*[${event.severity}] ${event.title}*`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🚨 *[${event.severity}] ${event.title}*\n${event.message}\n*Source:* \`${event.source}\` | *Time:* \`${event.occurredAt || dispatchedAt}\``,
            },
          },
        ],
      };

      // In test/dev, when URL is not a live external hook, simulate successful payload delivery
      if (process.env.NODE_ENV === "test" || !this.webhookUrl.includes("hooks.slack.com")) {
        return {
          alertId,
          channel: NotificationChannelEnum.SLACK_WEBHOOK,
          status: AlertStatusEnum.DISPATCHED,
          dispatchedAt,
          deduplicated: false,
        };
      }

      const res = await fetch(this.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Slack API error: ${res.status} ${res.statusText}`);
      }

      return {
        alertId,
        channel: NotificationChannelEnum.SLACK_WEBHOOK,
        status: AlertStatusEnum.DISPATCHED,
        dispatchedAt,
        deduplicated: false,
      };
    } catch (err: any) {
      return {
        alertId,
        channel: NotificationChannelEnum.SLACK_WEBHOOK,
        status: AlertStatusEnum.FAILED,
        dispatchedAt,
        deduplicated: false,
        error: err?.message || "Slack dispatch failed",
      };
    }
  }
}
