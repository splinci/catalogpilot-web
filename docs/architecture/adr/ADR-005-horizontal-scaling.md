# ADR-005: Horizontal Scale-Out & Stateless Application Tier Architecture

## Context
As concurrent user sessions and multi-region deployments grow, application nodes must operate statelessly across load-balanced clusters.

## Decision
1. **Stateless JWT Sessions**: Session verification relies on HTTP-Only JWT tokens signed with `JWT_SECRET`, requiring zero sticky sessions or server memory lookups.
2. **Pluggable Redis Backing**: Rate limiting, metrics collection, and caching modules support Redis backing stores (`REDIS_URL`) for distributed cluster deployments.
3. **Database Connection Pooling**: Prisma connections utilize Neon PostgreSQL serverless pooling to handle high-concurrency connection spikes safely.
