# SPLINCI COMMERCE OS — DEPLOYMENT PROMOTION RUNBOOK

## 1. Promotion Gates
```text
DEVELOPMENT → STAGING → PRODUCTION
```
- Promotion to `PRODUCTION` requires:
  1. 100% Passing Vitest suite (`npx vitest run --globals`).
  2. Successful Next.js production build (`npm run build`).
  3. Clean git diff (`git diff --check`).
  4. Formally APPROVED change record with segregation-of-duties sign-off.
