# SPLINCI COMMERCE OS — POST-DEPLOYMENT SMOKE TEST RUNBOOK

## 1. Health & Readiness Verification
Execute health checks against production URL:
```bash
curl -f -i https://app.splinci.com/api/health/live
curl -f -i https://app.splinci.com/api/health/ready
curl -f -i https://app.splinci.com/api/health
curl -f -i https://app.splinci.com/api/health/release
curl -f -i https://app.splinci.com/api/health/version
```
- Verify `/api/health/release` returns HTTP `200` with `{ "status": "release_ready" }`.
- Verify response headers contain `X-Request-ID`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.

## 2. Authentication Verification
1. Attempt login with valid user credentials → Verify redirection to `/catalog/dashboard` and receipt of `atlas_session` HTTP-Only cookie.
2. Attempt login with invalid password → Verify HTTP `401` error with sanitized error message.
3. Click `Logout` → Verify session cookie is cleared and redirection lands on `/login`.

## 3. Tenant Isolation & Authorization Verification
1. Log in as Merchant User A → Retrieve `/api/products` → Verify returned products belong ONLY to Tenant A (`companyId`).
2. Attempt to access `/administration/users` as `CATALOG_EDITOR` → Verify HTTP `403 Forbidden` response.

## 4. Critical Business Flow Verification
1. Create a draft product via `/catalog/create`.
2. Transition product status from `DRAFT` -> `STAGED` -> `APPROVED` -> `PUBLISHED`.
3. Adjust stock level on `/inventory` → Verify `AuditLog` transaction entry is written.
4. Execute inter-warehouse stock transfer → Verify atomic transaction completes cleanly.
