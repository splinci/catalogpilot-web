# SPLINCI COMMERCE OS — ENTERPRISE AI GOVERNANCE POLICY

## 1. Model Registry Governance
- No AI model or provider may be invoked outside the approved Model Registry (`APPROVED_AI_MODELS`).
- Requests invoking unregistered or disabled models are immediately blocked (`UNAPPROVED_MODEL`).

## 2. Multi-Tenant AI Isolation
- All AI request contexts, prompts, embeddings, and generated outputs are strictly bound to `companyId`.
- Cross-tenant AI job inspection is prohibited and generates a `CRITICAL` risk security audit event.
