# Emergency Application & Database Rollback Runbook

## 1. Rollback Criteria
Trigger emergency rollback if any of the following occur post-deployment:
- Critical API error rate > 2% over 5 minutes.
- Production readiness score drops to `NOT_READY`.
- Unresolved database migration error or connectivity loss.
- High severity security or multi-tenant isolation failure detected.

---

## 2. Rollback Steps

### Application Rollback
```bash
# Revert to previous stable release tag
git checkout v1.0.0-stable

# Re-build production bundle
npm run build

# Restart web application workers
npm run start
```

### Database Rollback
> **CAUTION**: Schema rollbacks containing destructive changes (`DROP TABLE`, `DROP COLUMN`) require Point-in-Time Restore from backup snapshot.

```bash
# For non-destructive migration rollbacks:
npx prisma migrate resolve --rolled-back <migration_name>
```
