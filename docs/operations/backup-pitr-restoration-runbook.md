# PostgreSQL Backup/PITR Restoration Verification & DR Certification Runbook

## 1. Overview
This runbook documents procedures for **Splinci Commerce OS PostgreSQL Backup & Point-in-Time Recovery (PITR) Verification** (`CI-008`).

---

## 2. Backup & Restore Architecture

```
PostgreSQL Database (Neon / AWS RDS / GCP Cloud SQL)
   │ (Daily Snapshots & Continuous WAL Archiving)
   ▼
BackupRecoveryService (Environment Guard: Staging Only)
   │
   ├─► Physical Staging Restore Execution
   ├─► Post-Restore Integrity Verification (Schema, ORM, Foreign Keys)
   ├─► RPO & RTO Measurement (Target RPO <= 5 mins; RTO <= 15 mins)
   └─► DR Certification Evaluation (Upgrades to DR_VERIFIED on success)
```

---

## 3. Physical Restore Safety Rules
1. **Target Guard**: Staging environment ONLY. If target URL contains `production`, execution is BLOCKED immediately with a safety violation exception.
2. **Data Integrity Audit**: Post-restore validation verifies core tables (`Company`, `User`, `Product`, `Order`, `Inventory`, `WorkflowDefinition`, `OutboxMessage`, `AuditLog`).
3. **No False Evidence**: Certification level MUST remain `OPERATIONALLY_READY` until physical restore drill completes.

---

## 4. Controlled Staging Exercise Execution
```bash
# Execute staging restore drill via REST API endpoint
POST /api/operations/backup-recovery/restore
{
  "environment": "staging",
  "restoreTarget": "staging_isolated_drill_db"
}
```
