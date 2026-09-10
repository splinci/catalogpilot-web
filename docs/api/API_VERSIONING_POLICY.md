# SPLINCI COMMERCE OS — PUBLIC API VERSIONING & DEPRECATION POLICY

## 1. Versioning Architecture
- All public REST APIs are versioned under URI prefixes: `/api/v1/...`.
- Breaking changes require a major version bump (`/api/v2/...`).
- Backward-compatible additions (new properties, optional filter params) are introduced within existing major versions.

## 2. Deprecation Lifecycle & Sunsetting
1. **Deprecation Notice:** 12 months minimum advance notice prior to major version removal.
2. **HTTP Deprecation Headers:**
   - `Deprecation: @1773000000` (Unix timestamp)
   - `Sunset: Wed, 21 Aug 2027 00:00:00 GMT`
   - `Link: <https://docs.splinci.com/api/v1/migration>; rel="successor-version"`
3. **Sunset Execution:** Deprecated endpoints return HTTP 410 Gone post sunset.
