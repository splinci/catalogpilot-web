# SPLINCI COMMERCE OS — TENANT DATA DELETION RUNBOOK

## 1. Multi-Step Deletion Process
```text
State: ACTIVE
    ↓ (Tenant Deletion Requested by Authorized Admin)
State: SUSPENDED (All mutations immediately blocked)
    ↓ (30-Day Compliance Grace Period)
State: PENDING_DELETION
    ↓ (Automated Purge Execution)
State: DELETED (Secure DB purge & audit record created)
```

## 2. Emergency Suspension & Reinstatement
- Administrators can transition a tenant to `SUSPENDED` instantly via `/api/users/status` or tenant management APIs to halt unauthorized data mutations.
