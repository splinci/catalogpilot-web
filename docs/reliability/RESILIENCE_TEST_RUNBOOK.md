# SPLINCI COMMERCE OS — RESILIENCE TEST RUNBOOK

## 1. Automated Failure Verification
- Run Vitest suite containing Section 18 Chaos Resilience tests to verify circuit breaker tripping, bulkhead limits, and idempotency key claiming.
- Validate that simulated infrastructure timeouts throw expected `CHAOS_SIMULATION_ACTIVE` exceptions without database corruption.
