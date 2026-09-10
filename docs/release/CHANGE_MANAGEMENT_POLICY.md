# SPLINCI COMMERCE OS — ENTERPRISE CHANGE MANAGEMENT POLICY

## 1. Change Classification
- **STANDARD:** Low-risk pre-approved operational changes.
- **NORMAL:** Routine application feature changes requiring architectural review and peer approval.
- **EMERGENCY:** Critical hotfixes resolving P0 production incidents, requiring post-incident review.

## 2. Segregation of Duties
- Self-approval of non-standard production changes is strictly prohibited (`SEGREGATION_OF_DUTIES_VIOLATION`).
- The change proposer and change approver must be distinct identity actors.
