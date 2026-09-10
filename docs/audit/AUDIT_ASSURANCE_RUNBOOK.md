# SPLINCI COMMERCE OS — AUDIT ASSURANCE RUNBOOK

## 1. External & Internal Audit Evidence Extraction
- Auditors extract tenant evidence logs via `/api/operations/certification/audit-controls` or `getTenantControlEvidence()`.
- SHA-256 payload hashes are verified against recorded transaction logs to prove compliance data integrity.
