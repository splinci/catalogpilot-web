# Operational Incident Response & Action Gate Guide

## 1. Severity Classification Matrix

| Severity | Definition | Response SLA | Target Action |
|---|---|---|---|
| **CRITICAL (P1)** | Platform down, database connectivity failure, or cross-tenant data exposure | **< 15 Mins** | Immediate Incident Commander dispatch, maintenance gate toggle |
| **HIGH (P2)** | Outbox queue delivery stalled, AI background job failures, or high DB latency | **< 1 Hour** | Operations team triage, outbox retry execution |
| **MEDIUM (P3)** | Non-blocking feature error or minor UI telemetry degradation | **< 24 Hours** | Scheduled maintenance patch |
| **LOW (P4)** | Informational warning or minor metric anomaly | **< 7 Days** | Standard sprint backlog item |

---

## 2. Action Gate Procedure
1. Access `/operations/incidents` in Operations Command Center.
2. Filter active incidents by source (`OUTBOX`, `AI_JOB`, `WORKFLOW`, `SECURITY_AUDIT`).
3. For P1/P2 incidents, inspect system health at `/operations/health` and review Outbox queue health at `/operations/outbox`.
4. Trigger manual outbox retries or purge old processed events after obtaining appropriate permission.
