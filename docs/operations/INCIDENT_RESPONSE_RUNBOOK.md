# SPLINCI COMMERCE OS — INCIDENT RESPONSE RUNBOOK

## 1. Incident Severity Classification

| Severity | Description | Target Response Time | Escalation Path |
| :--- | :--- | :--- | :--- |
| **SEV-1** | Complete production outage, total database disconnection, or confirmed security / tenant data breach. | < 15 minutes | Lead Security Engineer, CTO |
| **SEV-2** | Core functionality degraded (e.g. order creation or catalog publishing failing for multiple tenants). | < 30 minutes | Principal Software Architect |
| **SEV-3** | Partial degradation with viable operational workaround. | < 2 hours | Engineering On-Call |
| **SEV-4** | Minor UI cosmetic glitch or non-critical background task latency. | < 24 hours | Product Backlog |

## 2. Response Procedures

### Application Outage (SEV-1 / SEV-2)
1. Query `/api/health/live` to check if Node.js application process is responding.
2. Inspect structured server logs for `errorCode` and `requestId`.
3. Check platform ingress / Vercel operational status.

### Database Failure (SEV-1)
1. Query `/api/health/ready` to check database connectivity status.
2. Inspect Neon PostgreSQL serverless console for connection pool exhaustion or region outages.
3. Verify connection timeout limits and retry strategies in `src/lib/prisma.ts`.

### Authentication Incident (SEV-1 / SEV-2)
1. Inspect `securityLogger` logs for `AUTH_FAILURE` spikes.
2. Verify JWT signature secret `JWT_SECRET` validity.
3. Verify session cookie flags (`HttpOnly`, `Secure`, `SameSite=Lax`).

### Tenant Isolation / Authorization Breach (SEV-1)
1. **IMMEDIATE ACTION:** Restrict or isolate the affected route.
2. Capture request correlation identifier `X-Request-ID`.
3. Inspect `CROSS_TENANT_VIOLATION` log entries.
4. Execute audit query against `AuditLog` table to determine impacted tenant records.
5. Notify Security Response Officer and escalate as SEV-1.
