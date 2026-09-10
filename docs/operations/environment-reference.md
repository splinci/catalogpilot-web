# Environment Configuration Reference & Secrets Matrix

## 1. Overview
This document specifies all environment variables required for running Splinci Commerce OS in Development, Staging, and Production environments.

---

## 2. Environment Variable Matrix

| Variable Name | Purpose | Required | Server/Client | Production Status | Risk Level |
|---|---|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string with SSL mode | **YES** | Server-Only | Production Required | **CRITICAL** (DB Credentials) |
| `JWT_SECRET` | Secret key for signing session tokens | **YES** | Server-Only | Production Required | **CRITICAL** (Auth Bypass if leaked) |
| `GEMINI_API_KEY` | Google Gemini AI provider key | **YES** | Server-Only | Production Required | **HIGH** (Quota / Cost) |
| `NEXT_PUBLIC_APP_NAME` | Application display name | No | Client-Safe | Optional | Low |
| `NEXT_PUBLIC_APP_URL` | Base application canonical URL | **YES** | Client-Safe | Production Required | Medium (CORS/Redirects) |

---

## 3. Secret Management Guidelines
1. **Zero Hardcoded Secrets**: Secrets MUST NEVER be committed to Git repositories or hardcoded in source code.
2. **Server-Only Containment**: Variables prefixed with `NEXT_PUBLIC_` are exposed in browser client bundles. Server secrets MUST NOT carry the `NEXT_PUBLIC_` prefix.
3. **Production Injection**: Use AWS Secrets Manager, HashiCorp Vault, or Vercel/Cloud Environment Variables for production key injection.
