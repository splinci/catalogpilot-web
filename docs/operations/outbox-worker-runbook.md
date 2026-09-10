# Dedicated Outbox Worker & Background Processing Runbook

## 1. Overview
This document specifies operational guidelines for managing the dedicated **Splinci Commerce OS Outbox Worker Daemon** (`CI-001`).

---

## 2. Architecture & Operational Flow

```
Domain Transaction ──> OutboxMessage (PostgreSQL - Source of Truth)
                            │
                  OutboxDispatcher
                            │
               OutboxQueueAdapter (Redis/BullMQ)
                            │
                 Dedicated Outbox Worker
                            │
          Success ──> Status = PROCESSED (publishedAt)
          Failure ──> Exponential Backoff / Status = FAILED
```

---

## 3. Worker Environment Configuration

| Variable Name | Purpose | Default / Example | Required |
|---|---|---|---|
| `REDIS_URL` | Redis server connection string | `redis://localhost:6379` | Required for BullMQ queue mode |
| `OUTBOX_QUEUE_NAME` | BullMQ queue identifier | `splinci_outbox_queue` | Optional (default fallback) |
| `OUTBOX_WORKER_CONCURRENCY` | Concurrent worker processing concurrency | `5` | Optional |
| `OUTBOX_MAX_RETRIES` | Max retry limit before marked FAILED | `5` | Optional |

---

## 4. Starting and Stopping the Worker Daemon

### Local / Development Mode:
```bash
npx tsx scripts/outbox-worker-daemon.ts
```

### Production Deployment Mode:
```bash
# Start background worker daemon via PM2 / systemd / Docker container
pm2 start scripts/outbox-worker-daemon.ts --name splinci-outbox-worker
```

### Graceful Stop:
The worker listens for `SIGINT` and `SIGTERM` signals. Upon receiving a shutdown signal, it finishes active jobs and terminates cleanly without leaving partial records.

---

## 5. Emergency Outbox Recovery Procedures

### Scenario 1: Redis Queue Connectivity Interruption
- The worker automatically logs connection failures and pauses queue polling.
- PostgreSQL `OutboxMessage` table remains 100% durable and uncorrupted.
- Upon Redis reconnect, `OutboxDispatcher` re-scans pending records and resumes processing.

### Scenario 2: High Poisoned Message Backlog
- Access `/operations/outbox` in the Operations Command Center.
- Inspect `FAILED` messages.
- Trigger manual retry via `POST /api/operations/outbox/[id]/retry` or purge old processed events.
