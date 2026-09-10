# SPLINCI COMMERCE OS — USER IDENTITY LIFECYCLE POLICY

## 1. Identity State Lifecycle
- User identities follow: `PROVISIONED` -> `ACTIVE` -> `SUSPENDED` -> `DEPROVISIONED`.
- Suspended or deprovisioned user identities are immediately blocked from authenticating (`AUTHENTICATION_BLOCKED`).

## 2. Dormant Account Suspension
- Automated background jobs audit user activity. Accounts remaining inactive for > 90 days are automatically transitioned to `SUSPENDED`.
