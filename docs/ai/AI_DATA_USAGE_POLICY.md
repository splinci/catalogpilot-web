# SPLINCI COMMERCE OS — AI DATA USAGE & CLASSIFICATION PROTECTION POLICY

## 1. Classification Protection
- `RESTRICTED` fields (passwords, password hashes, API key hashes, connection strings) must NEVER be transmitted to external AI models.
- `CONFIDENTIAL` fields and PII are automatically sanitized and redacted (`[REDACTED_CONFIDENTIAL_DATA]`) before external model execution.

## 2. Output Schema Validation
- All structured AI responses undergo Zod schema validation before mutating application state (`validateAiStructuredOutput`).
- Unvalidated AI output is treated as untrusted input.
