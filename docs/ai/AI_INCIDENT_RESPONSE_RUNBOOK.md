# SPLINCI COMMERCE OS — AI INCIDENT RESPONSE RUNBOOK

## 1. Provider Outages & Fallbacks
- In the event of provider latency spikes or timeouts (> 15,000ms), circuit breaker trips (`AI_PROVIDER_CIRCUIT_OPEN`).
- Fallbacks automatically reroute requests to secondary approved models within the Model Registry (e.g., `gemini-1.5-pro` -> `gemini-1.5-flash`).

## 2. Prompt Injection & Misbehavior Escalation
- Repeated prompt injection attempts trigger automatic IP rate-limiting and user session flag for administrator review.
