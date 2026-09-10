# SPLINCI COMMERCE OS — DISASTER RECOVERY RUNBOOK

## 1. Governance Policy & Targets
- **Recovery Point Objective (RPO):** < 1 hour (Target database point-in-time recovery for Neon PostgreSQL).
- **Recovery Time Objective (RTO):** < 2 hours (Service restoration to standby region).

> [!IMPORTANT]
> **Production Safety Safeguard:**
> **DO NOT RESTORE DIRECTLY INTO PRODUCTION WITHOUT AUTHORIZATION.**

## 2. Backup Strategy & Provider Responsibility
- **Database Backup Provider:** Managed Neon PostgreSQL Serverless Automated Snapshots & Write-Ahead Logs (WAL).
- **Snapshot Frequency:** Automated continuous WAL archival and daily automated baseline snapshots.
- **Retention Period:** 30 days continuous point-in-time recovery (PITR).

## 3. Disaster Recovery & Restore Procedure

### Phase 1: Incident Declaration & Containment
1. Declare SEV-1 incident in communication channels.
2. Freeze application write operations where operationally possible.
3. Identify target timestamp for recovery ($RECOVERY_TIMESTAMP).

### Phase 2: Backup Integrity & Staging Restore
1. Provision isolated staging database cluster (`splinci-dr-staging`).
2. Execute point-in-time restore to staging cluster:
   ```bash
   neon branches create dr-restore-branch --parent main --at $RECOVERY_TIMESTAMP
   ```
3. Verify database schema integrity and table counts.

### Phase 3: Integrity & Tenant Isolation Verification
1. Run automated tenant data isolation check:
   ```bash
   npx vitest run --globals
   ```
2. Verify authentication and user password hashes.
3. Validate critical transactional entity states (`Product`, `InventoryItem`, `Order`, `AuditLog`).

### Phase 4: Authorized Production Cutover
1. Obtain explicit written authorization from Principal Software Architect / Lead Infrastructure Officer.
2. Update application production environment variable `DATABASE_URL` to point to restored cluster.
3. Restart production application cluster.
4. Verify `/api/health/ready` returns HTTP 200 `{ status: "ready" }`.
