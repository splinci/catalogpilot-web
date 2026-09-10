# SPLINCI COMMERCE OS — HEALTH & READINESS GOVERNANCE

## 1. Endpoints & Security Scoping
- `/api/health/live`: Lightweight process liveness probe.
- `/api/health/ready`: Deep dependency readiness probe checking DB connectivity and pool health.
- Both endpoints sanitize responses to guarantee zero credential or stack trace exposure.
