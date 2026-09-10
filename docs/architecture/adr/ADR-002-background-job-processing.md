# ADR-002: Asynchronous Background Job Processing & Queue Governance

## Context
Long-running workloads such as AI catalog enrichment, bulk SKU imports, report generation, and workflow executions can cause HTTP request timeouts and resource exhaustion if executed synchronously.

## Decision
We enforce an asynchronous background job processing model managed via `asyncJobQueue`:
1. All long-running mutations return HTTP 202 Accepted with a `jobId` URL.
2. Background jobs enforce a maximum of 3 retries with exponential backoff.
3. Jobs exceeding maximum retry attempts are automatically moved to the Dead-Letter Queue (`DEAD_LETTER`).
4. All jobs are strictly tagged with `companyId` for tenant-scoped monitoring and status retrieval.
