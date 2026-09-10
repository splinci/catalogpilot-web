# SPLINCI COMMERCE OS — PRODUCTION DATABASE READINESS

## 1. Connection Resilience & Pool Policy
- Connection pooling configured for max 20 connections with 5s connection timeouts (`checkDatabaseReadiness`).
- Database migrations are governed by non-destructive schema checks before release promotion.
