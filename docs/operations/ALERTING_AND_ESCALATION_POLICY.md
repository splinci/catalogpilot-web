# SPLINCI COMMERCE OS — ALERTING & ESCALATION POLICY

## 1. Noise Suppression & Deduplication
- Alerts sharing identical fingerprints are suppressed within sliding time windows (`dispatchAlertWithSuppression`) to prevent alert fatigue.
