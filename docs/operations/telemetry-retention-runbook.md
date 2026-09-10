# Enterprise Historical Telemetry & Retention Runbook

## 1. Overview
This runbook documents operational procedures for managing the **Splinci Commerce OS Historical Telemetry & Retention Engine** (`CI-004`).

---

## 2. Telemetry Architecture & Data Retention Tiers

```
Runtime Telemetry ──> TelemetryHistoryService (Sampling Engine)
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      HealthCheck Table         TimeSeries Aggregation
     (Raw: 30-Day Retention)   (Hourly/Daily: 180D/2Yr Retention)
```

| Retention Tier | Retention Duration | Data Types Preserved | Purge Frequency |
|---|---|---|---|
| **RAW TELEMETRY** | 30 Days | High-frequency database latency & process memory samples | Daily Automated Purge |
| **HOURLY AGGREGATES** | 180 Days | Hourly min, max, average, p95 latency time-series summaries | Weekly Automated Purge |
| **DAILY AGGREGATES** | 730 Days (2 Years) | Daily SLO uptime, availability percentage & incident totals | Monthly Automated Purge |

---

## 3. Scope Isolation Principles
1. **Platform Telemetry**: Server memory heap, Node version, global database ping latency, background worker queue status.
2. **Tenant Telemetry**: Tenant-scoped outbox messages, tenant AI job failures, tenant workflow step executions, tenant incident logs.
3. **Multi-Tenant Protection**: Tenant scope parameters are strictly enforced via session context (`session.companyId`). Zero cross-tenant data leakage is permitted.

---

## 4. Emergency Database Capacity Procedures
- **Check Telemetry Growth**: Access `/api/operations/telemetry` or inspect database table metrics.
- **Manual Outbox & Health Purge**: Execute `OutboxOperationsService.purgeProcessedMessages(companyId, 7)` to release space occupied by historic processed events.
