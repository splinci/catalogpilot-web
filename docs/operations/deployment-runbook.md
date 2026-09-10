# Enterprise Production Deployment Runbook

## 1. Pre-Deployment Verification Checklist
- [ ] All Vitest active test suites passing (70/70 tests).
- [ ] `npm run build` succeeds cleanly with Exit Code 0.
- [ ] 0 TypeScript errors & 0 ESLint errors.
- [ ] Database backup snapshot triggered prior to release.
- [ ] Production environment variables verified in Secrets Manager.

---

## 2. Standard Deployment Sequence

```mermaid
graph TD
  A["1. Code Freeze & Release Tag"] --> B["2. Automated CI Build & Test"]
  B --> C["3. DB Migration Deploy (prisma migrate deploy)"]
  C --> D["4. Next.js Application Production Build"]
  D --> E["5. Traffic Cutover / Canary Release"]
  E --> F["6. Post-Deploy Smoke Test Checklist"]
```

### Command Execution Sequence:
```bash
# 1. Fetch latest release branch
git checkout main && git pull origin main

# 2. Execute database migrations safely
npx prisma migrate deploy

# 3. Build production bundle
npm run build

# 4. Start production server
npm run start
```
