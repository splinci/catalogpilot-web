# SPLINCI COMMERCE OS — APPLICATION ROLLBACK RUNBOOK

## 1. Preconditions & Pre-Rollback Checks
1. Identify faulty release commit SHA (`FAULTY_COMMIT_SHA`).
2. Identify last known good production release commit SHA (`LAST_KNOWN_GOOD_COMMIT`).
3. Verify schema compatibility: Confirm that rollback does NOT drop database columns or break Prisma schema contracts.

## 2. Standard Production Rollback Procedure

> [!WARNING]
> Do NOT run `git reset --hard` or `git push --force` directly against remote production branches.

### Step 1: Identify Target Baseline Commit
Inspect recent release history:
```bash
git log --oneline -10
```

### Step 2: Trigger Rollback Deployment
Deploy `LAST_KNOWN_GOOD_COMMIT` using the production deployment pipeline (Vercel Instant Rollback or Git deployment):
```bash
# Vercel Deployment Rollback Command
vercel rollback $DEPLOYMENT_ID
```
Or trigger deployment pipeline targeting commit `LAST_KNOWN_GOOD_COMMIT`.

### Step 3: Post-Rollback Operational Verification
Verify all system endpoints:
```bash
curl -i https://app.splinci.com/api/health/live
curl -i https://app.splinci.com/api/health/ready
curl -i https://app.splinci.com/api/health/release
curl -i https://app.splinci.com/api/health/version
```
Confirm `/api/health/version` displays release commit matching `LAST_KNOWN_GOOD_COMMIT`.
