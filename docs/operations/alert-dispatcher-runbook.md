# Enterprise Automated P1/P2 Incident Alert Dispatcher Runbook

## 1. Overview
This runbook details operational procedures for managing the **Splinci Commerce OS Automated Incident Alert Dispatcher** (`CI-003`).

---

## 2. Notification Architecture

```
SLO / Incident Event ──> AlertPolicy (Severity & Deduplication Evaluation)
                              │
                    AlertDispatcherService
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
   SlackWebhookProvider             GenericWebhookProvider
(SLACK_ALERT_WEBHOOK_URL)         (GENERIC_ALERT_WEBHOOK_URL)
```

---

## 3. Environment Variables & Credentials Matrix

| Variable Name | Purpose | Default / Example | Security Level |
|---|---|---|---|
| `ALERT_DISPATCH_ENABLED` | Master feature toggle | `true` (prod) / `false` (dev) | Config |
| `ALERT_MIN_SEVERITY` | Minimum severity dispatch threshold | `P2_HIGH` | Config |
| `SLACK_ALERT_WEBHOOK_URL` | Incoming Slack Webhook URL | `https://hooks.slack.com/services/...` | **SECRET (Server-only)** |
| `GENERIC_ALERT_WEBHOOK_URL` | Enterprise HTTPS Webhook URL | `https://alerts.splinci.com/webhook` | **SECRET (Server-only)** |
| `ALERT_DEDUP_WINDOW_SECONDS` | Deduplication window duration | `900` (15 Mins) | Config |

---

## 4. Alert Severity Mapping Matrix

| Alert Severity | Operational Triggers | Response Target SLA | Primary Notification Channel |
|---|---|---|---|
| **P1_CRITICAL** | Database disconnect, security failure, cross-tenant isolation error, critical SLO breach | **< 15 Mins** | Slack P1 Channel + On-Call Dispatch |
| **P2_HIGH** | Error budget warning/breach, outbox queue delivery stall, worker degradation | **< 1 Hour** | Operations Slack Channel |
| **P3_MEDIUM** | Non-critical UI telemetry degradation, transient AI job retry | **< 24 Hours** | Dashboard Alert Log |

---

## 5. Security & Credential Hygiene
1. **Zero Exposure**: Webhook secret URLs MUST NEVER be exposed in client HTTP responses, React component props, or application log files.
2. **Metadata Sanitization**: `AlertPolicy.sanitizeMetadata()` automatically redacts `token`, `secret`, `password`, `key`, or `authorization` fields from alert payloads.
