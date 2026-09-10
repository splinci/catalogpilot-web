# Operations Telemetry, Observability & Monitoring Guide

## 1. Key Telemetry Endpoints
- `GET /api/operations/health`: Platform status & database ping.
- `GET /api/operations/telemetry`: Diagnostic memory heap, Node version & DB latency.
- `GET /api/operations/readiness`: Dynamic production readiness score (0–100).
- `GET /api/operations/metrics`: Aggregated operational metrics summary.

---

## 2. Key Operational Thresholds

| Metric | Target Optimal | Warning Threshold | Critical Blocker |
|---|---|---|---|
| Database Latency | < 50ms | 100ms – 300ms | > 300ms / Disconnected |
| Outbox Queue Failures | 0 | 1 – 10 messages | > 10 failed messages |
| AI Ingestion Failures | 0 | 1 – 5 jobs | > 5 failed jobs |
| Critical Incidents | 0 | 0 | > 0 active critical incidents |
| Production Readiness | 100% | 75% – 99% (`DEGRADED`) | < 75% (`NOT_READY`) |
