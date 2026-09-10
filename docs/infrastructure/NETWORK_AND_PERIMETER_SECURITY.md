# SPLINCI COMMERCE OS — NETWORK & PERIMETER SECURITY

## 1. Perimeter Rules & Reverse Proxy Configuration
- Enforces strict CORS origins (`ALLOWED_ORIGINS`), Content-Security-Policy (CSP), X-Frame-Options (`DENY`), and X-Content-Type-Options (`nosniff`).
- Rate limiting middleware protects authentication and public API endpoints from brute-force or DDoS attacks.
