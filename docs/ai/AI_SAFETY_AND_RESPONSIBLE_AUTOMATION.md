# SPLINCI COMMERCE OS — AI SAFETY AND RESPONSIBLE AUTOMATION

## 1. Prompt Injection & Jailbreak Defense
- All incoming user prompts are evaluated against prompt injection and override pattern filters (`evaluatePromptSecurity`).
- Prompts attempting to extract system instructions or bypass authorization are blocked (`PROMPT_INJECTION_DETECTED`).

## 2. Human Approval Gates
- AI actions are classified by risk tier: `LOW_RISK`, `MEDIUM_RISK`, `HIGH_RISK`, `CRITICAL_RISK`.
- `HIGH_RISK` (publishing catalog changes) and `CRITICAL_RISK` (financial mutations, tenant state changes) REQUIRE explicit human approval.
- AI systems are strictly prohibited from executing autonomous financial mutations or tenant lifecycle changes.
