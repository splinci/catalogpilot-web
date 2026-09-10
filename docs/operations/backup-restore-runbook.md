# PostgreSQL Database Backup & Disaster Recovery Runbook

## 1. Executive Summary
- **Target RTO (Recovery Time Objective)**: 1 Hour
- **Target RPO (Recovery Point Objective)**: 5 Minutes (via Continuous WAL Archiving / Point-in-Time Recovery)
- **Database Provider**: Managed PostgreSQL (Neon / AWS RDS / GCP Cloud SQL)

---

## 2. Automated Backup Strategy
1. **Daily Automated Snapshots**: Taken at 02:00 UTC daily. Retention period: 30 days.
2. **Continuous WAL Archiving**: Point-in-time recovery enabled with 7-day continuous replay buffer.
3. **Pre-Deployment Snapshots**: Manual snapshot required prior to applying any production Prisma migration.

---

## 3. Disaster Recovery & Restore Procedure

### Step 1: Declare Incident & Lock Write Operations
```bash
# Set maintenance mode in production environment settings
# Prevent incoming write traffic
```

### Step 2: Perform Point-in-Time Restore (PITR)
```bash
# Example Neon/RDS Point-in-Time Restore command
# Restore to timestamp immediately prior to corrupting event (e.g. 2026-08-10T14:30:00Z)
```

### Step 3: Validate Restored Database Integrity
```bash
# Verify company, user, outbox, and audit trail tables
npx tsx scripts/verify-db-integrity.ts
```

### Step 4: Update Application Connection String
```bash
# Point DATABASE_URL to newly restored instance
# Redeploy / restart application services
```
