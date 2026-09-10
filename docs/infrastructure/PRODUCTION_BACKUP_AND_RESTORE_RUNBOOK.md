# SPLINCI COMMERCE OS — PRODUCTION BACKUP & RESTORE RUNBOOK

## 1. Backup Validation & Restoration Procedure
- Automated snapshot policies execute daily point-in-time recovery (PITR) backups.
- Real-world production restoration is flagged as `EXTERNAL_VERIFICATION_REQUIRED` until live cloud infrastructure executes an isolated staging restore drill.
