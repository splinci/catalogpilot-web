/**
 * ============================================================================
 * Splinci Commerce OS — Standalone Outbox Worker Daemon
 * ============================================================================
 * Specification Reference: CI-001 / DAEMON-001 / OPS-001
 * Entry Point for Dedicated Background Outbox Worker Process
 * ============================================================================
 */

import { outboxDispatcher } from "../src/infrastructure/queue/outbox-dispatcher";
import { outboxWorker } from "../src/infrastructure/worker/outbox-worker";

console.log("=== Splinci Commerce OS — Dedicated Outbox Worker Daemon ===");
console.log(`[Worker Startup] Mode: ${process.env.REDIS_URL ? "REDIS_BULLMQ" : "LOCAL_MEMORY"}`);
console.log(`[Worker Startup] Process PID: ${process.pid}`);

let isRunning = true;

async function runWorkerDaemon() {
  outboxWorker.startWorkerLoop(1000);

  while (isRunning) {
    try {
      // Poll DB for new pending outbox messages and dispatch into worker queue
      await outboxDispatcher.pollAndDispatch(50);
      await new Promise((res) => setTimeout(res, 2000));
    } catch (err: any) {
      console.error(`[Worker Daemon Error] ${err?.message || err}`);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

// Graceful Shutdown Handling
const shutdown = (signal: string) => {
  console.log(`[Worker Shutdown] Received ${signal}. Stopping worker loop...`);
  isRunning = false;
  outboxWorker.stopWorkerLoop();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

runWorkerDaemon();
