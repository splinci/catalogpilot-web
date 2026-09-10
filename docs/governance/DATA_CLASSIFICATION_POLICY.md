# SPLINCI COMMERCE OS — DATA CLASSIFICATION POLICY

## 1. Classification Tiers
1. **PUBLIC:** Public marketing information, public catalog product titles, categories, and public selling prices.
2. **INTERNAL:** Internal SKUs, category hierarchies, system settings, and aggregate metrics.
3. **CONFIDENTIAL:** Cost prices, wholesale supplier terms, customer data, audit log details, and PII (User names).
4. **RESTRICTED:** Passwords, API key hashes, JWT secrets, database connection strings, and encrypted integration tokens.

## 2. Handling & Storage Controls
- `RESTRICTED` data must be encrypted at rest and in transit. Raw credentials are never logged or exported.
- `CONFIDENTIAL` data is restricted to authorized tenant users with specific RBAC permissions.
