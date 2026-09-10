# SPLINCI COMMERCE OS — SCALABILITY, PERFORMANCE ENGINEERING & CAPACITY GOVERNANCE

## 1. Latency Targets & Performance SLA Baselines

| Critical API Endpoint | P50 SLA Target | P95 SLA Target | P99 SLA Target | Max Payload Size |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & Session Validation** | `< 15ms` | `< 50ms` | `< 100ms` | 64 KB |
| **Product Catalog Queries** (`/api/products`) | `< 40ms` | `< 150ms` | `< 300ms` | 1 MB |
| **Inventory & Warehouse Operations** (`/api/wms/inventory`) | `< 30ms` | `< 100ms` | `< 250ms` | 1 MB |
| **User & Role Administration** (`/api/users`) | `< 25ms` | `< 100ms` | `< 200ms` | 256 KB |
| **Health & Diagnostic Endpoints** (`/api/health`) | `< 10ms` | `< 50ms` | `< 80ms` | 16 KB |

## 2. Pagination Limits & Memory Exhaustion Controls
- **Default Page Size:** `20 records`
- **Hard Maximum Page Size:** `100 records` (`MAX_PAGE_LIMIT`)
- All requests attempting `limit > 100` are automatically clamped to `100` by `parsePaginationParams()`.
- Standardized Pagination Response Metadata:
  ```json
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "totalPages": 8
    }
  }
  ```

## 3. Tenant-Aware Caching Strategy
- **Tenant Key Scoping:** `${companyId}:${cacheKey}` (e.g. `tenant:cmp_123:categories`).
- **TTL Policies:**
  - Reference Categories & Brands: `300 seconds`
  - User Roles & Capabilities: `120 seconds`
  - Dashboard Aggregates: `30 seconds`
- **Invalidation Guarantee:** Mutations (`create`, `update`, `delete`) execute `tenantCache.invalidate(companyId)`.

## 4. Query Governance & Anti-N+1 Protection
- Explicit `select` or `include` joins enforced across all repository queries.
- Unbounded `findMany()` queries without `take` bounds are strictly prohibited.
- `companyId` composite database indexes enforce fast multi-tenant query lookups.
