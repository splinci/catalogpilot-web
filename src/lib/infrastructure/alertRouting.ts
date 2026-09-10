export interface AlertRoutingConfigReport {
  provider: string;
  configured: boolean;
  status: "ALERT_ROUTING_CONFIGURED" | "ALERT_ROUTING_UNCONFIGURED" | "ALERT_ROUTING_EXTERNAL_VERIFICATION_REQUIRED";
}

export function evaluateAlertRoutingReadiness(env: Record<string, string | undefined> = process.env): AlertRoutingConfigReport {
  const webhookUrl = env.PAGERDUTY_WEBHOOK_URL || env.OPSGENIE_WEBHOOK_URL;
  if (webhookUrl) {
    return {
      provider: env.PAGERDUTY_WEBHOOK_URL ? "PagerDuty" : "OpsGenie",
      configured: true,
      status: "ALERT_ROUTING_CONFIGURED",
    };
  }

  return {
    provider: "PagerDuty / OpsGenie (Pending Config)",
    configured: false,
    status: "ALERT_ROUTING_EXTERNAL_VERIFICATION_REQUIRED",
  };
}
