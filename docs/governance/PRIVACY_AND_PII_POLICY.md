# SPLINCI COMMERCE OS — PRIVACY AND PII PROTECTION POLICY

## 1. PII Field Minimization
- Splinci collects minimal required PII fields for user account management: `firstName`, `lastName`, and `email`.
- PII fields are never stored in operational telemetry logs, client error tracebacks, or public API envelopes.

## 2. Redaction & Anonymization
- All structured logs run through `redactSensitiveData()`.
- Deleted tenant users undergo PII anonymization (`email: anon_usr_123@deleted.local`).
