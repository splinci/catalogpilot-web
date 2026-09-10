# SPLINCI COMMERCE OS — PRODUCTION RELEASE GOVERNANCE CHECKLIST

## 1. Source Control & Working Tree
- [ ] `git status` returns `nothing to commit, working tree clean`.
- [ ] Release commit SHA is identified and recorded.
- [ ] Working branch is `main`.

## 2. Automated Quality & Build Verification
- [ ] All Vitest test suites pass (`npx vitest run --globals`).
- [ ] Production build succeeds without TypeScript or bundling errors (`npm run build`).

## 3. Security & Governance Controls
- [ ] HTTP Security Headers enabled (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS`).
- [ ] Multi-tenant isolation verified (`companyId` enforced across all API routes).
- [ ] Capability-based RBAC enforced (`requirePermission`).
- [ ] API error sanitization verified (No stack traces or database URLs returned).
- [ ] Sensitive data redaction active in structured logger (`[REDACTED]`).

## 4. Operational Health Signals
- [ ] `GET /api/health/live` returns HTTP 200 `{ status: "live" }`.
- [ ] `GET /api/health/ready` returns HTTP 200 `{ status: "ready" }`.
- [ ] `GET /api/health/release` returns HTTP 200 `{ status: "release_ready" }`.
- [ ] `GET /api/health/version` returns valid release commit metadata.
