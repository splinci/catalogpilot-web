# ADR-004: Distributed Tenant Cache Strategy & Leakage Prevention

## Context
High-frequency reads for reference data (categories, brand registries, user roles) require caching to maintain P95 latency < 150ms.

## Decision
We enforce a tenant-isolated caching strategy (`tenantCache`):
1. All cache keys are prefixed with `tenant:${companyId}:${key}` to prevent cross-tenant cache contamination.
2. Short TTLs (60s to 300s) prevent stale state.
3. Write mutations execute explicit invalidation (`tenantCache.invalidate(companyId)`).
