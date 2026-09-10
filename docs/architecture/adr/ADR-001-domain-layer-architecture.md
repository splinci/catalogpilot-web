# ADR-001: Clean Domain Layer Architecture & Boundaries

## Context
Splinci Commerce OS is built on Next.js 16 with Turbopack. As catalog, inventory, and procurement features scale across multi-tenant deployments, preventing tight coupling between API routes and database schemas is critical.

## Decision
We enforce a 4-tier clean architecture boundary:
1. **Presentation / UI Layer (`src/app/`, `src/components/`)**: Handles UI rendering and React state.
2. **API Router Layer (`src/app/api/`)**: Validates HTTP requests, handles session authentication, checks permissions, and delegates directly to Domain Services.
3. **Domain Services Layer (`src/services/`, `src/domains/`)**: Implements business rules, state policy machines, and domain logic.
4. **Repository & Data Access Layer (`src/repositories/`, `src/lib/prisma.ts`)**: Encapsulates database access with mandatory tenant isolation filtering (`companyId: session.companyId`).

## Consequences
- Route handlers must NEVER import `prisma` directly.
- Business state transitions must execute inside Domain Policy Machines (e.g. `productStatusPolicy.ts`).
