# SPLINCI COMMERCE OS — CONTROL EVIDENCE STANDARD

## 1. Tamper-Evident Evidence Format
- All evidence records capture `evidenceId`, `controlId`, `companyId`, `timestamp`, `actorUserId`, `source`, and `payloadHash`.
- Payload hashes are computed via SHA-256 (`crypto.createHash('sha256')`) to guarantee tamper evidence.
