# SPLINCI COMMERCE OS — DEPLOYMENT PACKAGING

## 1. Containerization & Non-Root Execution
- Multi-stage Docker build (`Dockerfile`) isolates runtime artifacts and executes under a non-root `nextjs` security user (`uid 1001`).
