# SPLINCI COMMERCE OS — FINANCIAL CONTROLS, BILLING & COMMERCIAL GOVERNANCE

## 1. Monetary Precision Rules
- Floating-point calculations for currency amounts are strictly prohibited.
- All monetary amounts are created, stored, and calculated in integer minor units (`amountCents`).
- Currency operations (`add`, `subtract`, `compare`) require matching ISO 4217 currency codes.

## 2. Subscription & Invoice State Policy Machines
- **Subscription Lifecycle:** `TRIAL` -> `ACTIVE` -> `PAST_DUE` -> `SUSPENDED` -> `CANCELLED`.
- **Invoice Lifecycle:** `DRAFT` -> `ISSUED` -> `PARTIALLY_PAID` -> `PAID` -> `OVERDUE` / `VOID` / `WRITTEN_OFF`.

## 3. Accounting Period Close Governance
- Accounting periods (`2026-Q1`, `2026-08`) transition through `OPEN` -> `CLOSING` -> `CLOSED`.
- Mutations targeted at `CLOSED` accounting periods are immediately rejected by `validateFinancialMutationInPeriod()`.

## 4. Immutable Financial Audit Ledger
- Every financial mutation (`INVOICE_CREATED`, `PAYMENT_RECEIVED`, `PAYMENT_FAILED`, `REFUND_ISSUED`, `CREDIT_APPLIED`, `PERIOD_CLOSED`) generates an immutable `FinancialAuditEvent`.
