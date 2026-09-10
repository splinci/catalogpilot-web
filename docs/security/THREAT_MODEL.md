# SPLINCI COMMERCE OS — FORMAL THREAT MODEL & RISK MATRIX

## 1. Threat Vectors & Defensive Mitigations

| Threat Category | Potential Impact | Defensive Control | Governance Layer |
| :--- | :--- | :--- | :--- |
| **Authentication & Session Hijacking** | Unauthorized session takeover | Argon2 password hashing, HTTP-Only SameSite=Lax JWT cookies | GOV-004 / GOV-007 |
| **Broken Authorization / Privilege Escalation** | Unauthorized administrative mutation | Capability RBAC (`requirePermission`) & Zero-Trust Policy Engine | GOV-005 / GOV-017 |
| **Cross-Tenant Data Exposure** | Data leak across tenant boundaries | Mandatory `companyId: session.companyId` DB query filters | GOV-004 / GOV-006 |
| **API Abuse & Brute-Force** | Denial of Service, resource exhaustion | Token-bucket rate limiters & request payload caps | GOV-007 / GOV-013 |
| **Webhook Spoofing & Replay** | Fake external mutation injection | HMAC SHA256 signature verification & timestamp freshness | GOV-014 / GOV-015 |
| **Credential & Secret Exposure** | Production infrastructure compromise | Secrets stored as environment variables; API key hashing at rest | GOV-009 / GOV-017 |
| **Supply Chain & Dependency CVEs** | Compromised npm package dependencies | Automated `npm audit` scanning & lockfile verification | GOV-012 / GOV-017 |

## 2. Zero-Trust Architecture Principle
> **NEVER TRUST REQUEST CONTEXT IMPLICITLY.**  
> **ALWAYS VERIFY IDENTITY, TENANT BOUNDARY, CAPABILITY PERMISSION, AND CREDENTIAL SCOPE ON EVERY REQUEST.**
