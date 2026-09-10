# SPLINCI COMMERCE OS — PRODUCTION OBSERVABILITY SETUP

## 1. Structured Logging & Secret Masking
- All application telemetry uses structured JSON output with automatic correlation IDs.
- Log sanitizers filter JWT tokens, DB connection strings, and PII before flushing to stdout.
