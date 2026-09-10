# SPLINCI COMMERCE OS — CONTINUOUS COMPLIANCE & SECURITY RUNBOOK

## 1. Continuous Security Automated Scanning & Gates
- **Secret Scanning:** CI/CD pipeline enforces `git diff --check` and secret scanners to prevent committing API keys, tokens, or database credentials.
- **Dependency Audit:** Monthly `npm audit` scanning to patch high/critical vulnerability CVEs.
- **Static Code Analysis & Linting:** Enforces strict TypeScript (`npm run build`) and ESLint checks (`npm run lint`).

## 2. Automated Authorization Regression Suite
- Enforces execution of `npx vitest run --globals` prior to staging and production release deployments.
- Regression suite verifies:
  1. Capability-based RBAC boundary enforcement across `ADMIN`, `CATALOG_EDITOR`, and `WAREHOUSE_MANAGER` roles.
  2. Multi-tenant data isolation (`companyId: session.companyId`).
  3. Sensitive data redaction in structured logs.
  4. Sanitization of HTTP error responses (no stack traces or database URLs).

## 3. Continuous Compliance Audit Schedule
- **Weekly:** Automated Vitest test suite execution and dependency vulnerability review.
- **Monthly:** Error budget consumption and SLO compliance audit.
- **Quarterly:** Disaster recovery restore drill and penetration test.
