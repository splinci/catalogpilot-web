# Enterprise Production Validation & DR Certification Runbook

## 1. Overview
This runbook documents procedures for **Splinci Commerce OS Production Validation, DR Exercise Execution & Readiness Certification** (`CI-007`).

---

## 2. Validation & Certification Model

```
Controlled Failure Scenarios ──> ProductionValidationPolicy
                                           │
                           ProductionValidationService
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         ▼                                 ▼                                 ▼
RTO Measured Verification         RPO Measured Verification      Operational Certification Level
```

---

## 3. Certification Rules & Safeguards

| Certification Level | Requirements | DR Verified Status | Production Certified Status |
|---|---|---|---|
| **OPERATIONALLY_READY** | Baseline app/worker/queue scenarios verified; DB backup restore unverified | `false` | `false` |
| **DR_VERIFIED** | Physical staging database snapshot restore drill completed | `true` | `false` |
| **PRODUCTION_CERTIFIED** | 100% scenarios verified + physical DB restore evidence | `true` | `true` |

---

## 4. Controlled Exercise Procedures
1. **Application Process Restart Drill**: Simulate Next.js process restart and verify health endpoint HTTP 200 within 2 minutes.
2. **Worker Restart Drill**: Execute `outboxWorker.stopWorkerLoop()` followed by `outboxWorker.startWorkerLoop()` to verify continuous event processing without duplication.
3. **Database Restore Validation Drill**: Execute PITR database restoration on staging environment.
4. **Alert Notification Drill**: Execute automated alert dispatch test via `AlertDispatcherService`.
