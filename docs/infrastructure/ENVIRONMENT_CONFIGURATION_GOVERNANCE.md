# SPLINCI COMMERCE OS — ENVIRONMENT CONFIGURATION GOVERNANCE

## 1. Production Environment Schema & Validation
- `validateProductionEnvironmentConfig()` enforces mandatory production environment variables (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ENCRYPTION_SECRET`, `WEBHOOK_HMAC_SECRET`).
- Server secrets are isolated from client-side runtime bundles (`NEXT_PUBLIC_` prefix restriction).
