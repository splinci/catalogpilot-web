# SPLINCI COMMERCE OS — SECRET & KEY MANAGEMENT POLICY

## 1. Secret Storage & Rotation Governance
- All production secrets must be injected at runtime via KMS / AWS Secrets Manager / Vault.
- Hardcoded secrets or unmasked credentials in source code or build logs trigger immediate release blockage.
