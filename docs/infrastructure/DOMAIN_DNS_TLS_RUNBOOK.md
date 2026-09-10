# SPLINCI COMMERCE OS — DOMAIN, DNS & TLS RUNBOOK

## 1. Domain Configuration & HTTPS Enforcement
- Target production domain: `https://app.splinci.com`.
- Requires HSTS (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`), HTTP to HTTPS redirection, and TLS 1.3 certificate binding.
- Live DNS A/CNAME record propagation flagged as `EXTERNAL_VERIFICATION_REQUIRED`.
