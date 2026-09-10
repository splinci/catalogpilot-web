# SPLINCI COMMERCE OS — FAILOVER & SERVICE CONTINUITY POLICY

## 1. Controlled Failover State Machine
- Lifecycle: `PRIMARY` -> `DEGRADED` -> `FAILING_OVER` -> `SECONDARY_ACTIVE` -> `RESTORING_PRIMARY` -> `NORMALIZED`.
- Rejects unvalidated or out-of-sequence state transitions (`UNSAFE_FAILOVER_TRANSITION`).
