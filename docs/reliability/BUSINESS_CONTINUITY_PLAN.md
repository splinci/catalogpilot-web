# SPLINCI COMMERCE OS — BUSINESS CONTINUITY PLAN

## 1. Objectives & RTO/RPO Targets
- **Recovery Time Objective (RTO):** < 15 Minutes for critical core API availability.
- **Recovery Point Objective (RPO):** < 1 Minute (zero data loss for committed DB transactions).

## 2. Emergency Escalation & Failover
- In the event of primary database availability degradation, failover to secondary read/write replica is triggered.
- Third-party integration outages trigger circuit breakers (`OPEN` state) and route requests to asynchronous Dead-Letter Queues (`DEAD_LETTER`).
