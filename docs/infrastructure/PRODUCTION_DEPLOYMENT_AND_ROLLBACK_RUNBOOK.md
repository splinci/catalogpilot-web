# SPLINCI COMMERCE OS — DEPLOYMENT VERIFICATION & ROLLBACK RUNBOOK

## 1. Automated Post-Deployment Verification
- Post-deployment health probes test `/api/health/ready` within 60s of release deployment.
- Instant automated rollbacks (`triggerDeploymentRollback`) revert live traffic to previous immutable container tags upon verification failure.
