# SPLINCI COMMERCE OS — SECRET MANAGEMENT & CREDENTIAL PROTECTION POLICY

## 1. Core Principles
1. **NO SECRET IN SOURCE CODE:** Secrets must never be committed to repository code or documentation.
2. **NO RAW API KEY AT REST:** API keys issued to machine clients are stored solely as SHA-256 hashes (`keyHash`).
3. **NO SECRET IN LOGS:** Structured logger executes `redactSensitiveData()` on all JSON log entries.
4. **NO SECRET IN CLIENT RESPONSES:** API endpoints strip `passwordHash`, `keyHash`, and `credentialsEncrypted` from client envelopes.

## 2. Environment Secret Storage
- Production secrets (`DATABASE_URL`, `JWT_SECRET`, `NEON_API_KEY`) are injected at runtime via deployment environment configuration (`env.ts`).
