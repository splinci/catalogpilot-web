# SPLINCI COMMERCE OS — CHAOS ENGINEERING POLICY

## 1. Principles of Chaos Engineering
- Controlled failure injection is conducted to verify platform resilience under real-world infrastructure failures.
- Failure simulations (`DATABASE_TIMEOUT`, `AI_PROVIDER_OUTAGE`, `INTEGRATION_FAILURE`, `WEBHOOK_DELIVERY_FAILURE`, `CACHE_FAILURE`, `WORKER_CRASH`) must never be executed in live production environments without explicit maintenance windows.

## 2. Safety Guards
- Circuit breakers, bulkheads, and fallback mechanisms must activate automatically during failure events without compromising tenant data boundaries.
