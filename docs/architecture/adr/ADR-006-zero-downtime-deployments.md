# ADR-006: Zero-Downtime Deployments & Migration Governance

## Context
Deploying system updates must execute without service disruption, downtime windows, or broken API contracts for active tenant sessions.

## Decision
1. **Expand-and-Contract Database Migrations**: Database schema migrations add new columns/tables first (`Expand`), backfill data asynchronously, and remove legacy columns in a subsequent release (`Contract`).
2. **Rolling Web Server Deployments**: Serverless Vercel / Next.js deployments swap traffic instantly after pre-flight health checks pass (`/api/health/ready` -> 200 OK).
3. **Graceful Backward Compatibility**: API handlers maintain compatibility for preceding version endpoints during release transitions.
