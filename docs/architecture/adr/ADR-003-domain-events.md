# ADR-003: Tenant-Isolated Domain Event Bus Architecture

## Context
Decoupling domain side-effects (such as audit logging, notifications, stock reservation adjustments, and workflow triggers) requires a centralized domain event publishing model.

## Decision
We implement a strongly typed `DomainEventBus`:
1. Domain events (`PRODUCT_CREATED`, `PRODUCT_PUBLISHED`, `INVENTORY_ADJUSTED`, `STOCK_TRANSFERRED`, `USER_INVITED`) are dispatched after atomic database transactions commit.
2. Every domain event includes `eventId`, `eventType`, `companyId`, `actorUserId`, and `timestamp`.
3. Event subscribers receive events strictly scoped to their tenant `companyId`.
