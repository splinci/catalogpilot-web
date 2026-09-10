# SPLINCI COMMERCE OS — SLO / SLA GOVERNANCE & ALERTING POLICY

## 1. Service Level Objectives (SLOs) & Indicators (SLIs)

| Service Metric | Target SLO | SLI Equation | Error Budget |
| :--- | :--- | :--- | :--- |
| **API Availability** | **99.9%** | `(Successful 2xx/3xx/4xx / Total Requests) * 100` | 0.1% (1 out of 1,000 requests) |
| **API Response Latency** | **P95 < 500ms** | 95th Percentile HTTP Response Latency (ms) | N/A |
| **Authentication Success** | **99.5%** | `(Successful Logins / Login Attempts) * 100` | 0.5% |
| **Database Availability** | **99.99%** | `(Database Ping Success / Total Pings) * 100` | 0.01% (4.38 min/month) |

## 2. Alerting Severity Matrix & Dispatch Policies

### SEV-1 (Critical Infrastructure / Security Outage)
- **Triggers:** Database connection drop, cross-tenant security breach attempt, API Availability < 95.0%.
- **Dispatch Channel:** On-Call Pager, Security Emergency Slack, PagerDuty.
- **Response SLA:** < 15 minutes.

### SEV-2 (Core Feature Degradation / SLO Warning)
- **Triggers:** Error budget remaining < 20%, auth failure spike (> 50/min), P95 Latency > 1000ms.
- **Dispatch Channel:** Engineering Ops Slack, Email.
- **Response SLA:** < 30 minutes.

### SEV-3 (Abuse & Rate-Limit Threshold Spike)
- **Triggers:** Rate-limit violations > 100/min, background job execution queue lag > 15 min.
- **Dispatch Channel:** DevOps Warning Channel.
- **Response SLA:** < 2 hours.
