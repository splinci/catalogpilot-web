# SPLINCI COMMERCE OS — SERVICE DEPENDENCY MAP

## 1. Primary Dependencies Matrix

| Service / Component | Tier | Criticality | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| **Neon PostgreSQL DB** | Core | Critical | Standby Replica Failover |
| **Vercel Edge Gateway** | Edge | Critical | Multi-Region DNS Routing |
| **In-Memory Tenant Cache**| Cache| Non-Critical | Direct Database Query |
| **Google Vertex AI** | AI | Non-Critical | Local Rule Fallback / Secondary Model |
| **Third-Party Webhooks**| M2M | Non-Critical | Outbound Retry Queue / Dead-Letter |
