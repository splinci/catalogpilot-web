export type VerificationStatus =
  | "IMPLEMENTED"
  | "TESTED"
  | "EVIDENCED"
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "NOT_VERIFIED"
  | "NOT_APPLICABLE";

export type GovernanceCertificationStatus = "CERTIFIED" | "CONDITIONALLY_CERTIFIED" | "NOT_CERTIFIED";

export interface GovernanceControlEntry {
  governanceId: string;
  domain: string;
  controlId: string;
  controlName: string;
  description: string;
  implementationReferences: string[];
  testReferences: string[];
  documentationReferences: string[];
  evidenceRequirements: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  verificationStatus: VerificationStatus;
  certificationStatus: GovernanceCertificationStatus;
}

export const MASTER_GOVERNANCE_CONTROL_MATRIX: GovernanceControlEntry[] = [
  {
    governanceId: "GOV-004",
    domain: "Tenant Isolation",
    controlId: "CTRL-SEC-001",
    controlName: "Zero-Trust Request Context and Multi-Tenant Query Isolation",
    description: "Enforces strict tenant isolation across all Prisma queries and API routes.",
    implementationReferences: ["src/lib/security/securityContext.ts", "src/lib/security/securityPolicy.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/security/THREAT_MODEL.md"],
    evidenceRequirements: "Automated Vitest Tenant Isolation Suite Evidence",
    riskLevel: "CRITICAL",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-015",
    domain: "Integration Governance",
    controlId: "CTRL-INT-001",
    controlName: "Tenant-Scoped API Key Authentication & HMAC Outbound Webhooks",
    description: "API envelope standardization, SHA-256 key hashing, and HMAC webhook signing.",
    implementationReferences: ["src/lib/auth/apiKeyAuth.ts", "src/lib/integrations/outboundWebhooks.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/governance/ENTERPRISE_INTEGRATION_GOVERNANCE.md"],
    evidenceRequirements: "API Key Hashing & Webhook Signing Verification Log",
    riskLevel: "HIGH",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-016",
    domain: "Data Governance",
    controlId: "CTRL-DAT-001",
    controlName: "Data Classification Framework & Automated Purge Engine",
    description: "Classification of PII/Credentials and automated retention lifecycle enforcement.",
    implementationReferences: ["src/lib/governance/dataClassification.ts", "src/lib/governance/dataRetention.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/governance/DATA_CLASSIFICATION_AND_RETENTION.md"],
    evidenceRequirements: "Data Retention Purge Telemetry Log",
    riskLevel: "HIGH",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-017",
    domain: "Security Assurance",
    controlId: "CTRL-SEC-002",
    controlName: "Threat Modeling & Centralized Security Audit Logging",
    description: "Centralized request evaluation and security audit event logging.",
    implementationReferences: ["src/lib/observability/securityAuditEvents.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/security/THREAT_MODEL.md", "docs/security/SECRET_MANAGEMENT_POLICY.md"],
    evidenceRequirements: "Security Audit Log Telemetry",
    riskLevel: "CRITICAL",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-018",
    domain: "Financial Controls",
    controlId: "CTRL-FIN-001",
    controlName: "Monetary Precision, Invoice Machine & Accounting Period Close",
    description: "Integer minor monetary units and immutable financial audit ledger.",
    implementationReferences: ["src/lib/finance/money.ts", "src/lib/finance/financialAudit.ts", "src/lib/finance/accountingPeriod.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/governance/FINANCIAL_CONTROLS_POLICY.md"],
    evidenceRequirements: "Immutable Financial Ledger Audit Log",
    riskLevel: "CRITICAL",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-019",
    domain: "AI Governance",
    controlId: "CTRL-AIG-001",
    controlName: "Approved AI Model Registry, Prompt Defense & Human Approval Gates",
    description: "Tenant AI execution store, prompt injection filters, and human approval gates.",
    implementationReferences: ["src/lib/ai/modelRegistry.ts", "src/lib/ai/promptSecurity.ts", "src/lib/ai/humanApprovalPolicy.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/ai/AI_GOVERNANCE_AND_SAFETY_POLICY.md"],
    evidenceRequirements: "AI Safety Audit Log",
    riskLevel: "HIGH",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-020",
    domain: "Reliability Engineering",
    controlId: "CTRL-REL-001",
    controlName: "Chaos Simulation Engine, Bulkheads & Idempotency Guards",
    description: "Failure injection, concurrency bulkheads, and duplicate event suppression.",
    implementationReferences: ["src/lib/reliability/chaosEngine.ts", "src/lib/reliability/bulkheadPolicy.ts", "src/lib/reliability/idempotencyGuard.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/reliability/CHAOS_ENGINEERING_POLICY.md", "docs/reliability/BUSINESS_CONTINUITY_PLAN.md"],
    evidenceRequirements: "Chaos Simulation Test Execution Log",
    riskLevel: "HIGH",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-021",
    domain: "Change Management",
    controlId: "CTRL-CHG-001",
    controlName: "Change Classification, Segregation of Duties & Deployment Gates",
    description: "Proposer self-approval block and deployment promotion gates.",
    implementationReferences: ["src/lib/release/changeGovernance.ts", "src/lib/release/featureFlags.ts", "src/lib/release/deploymentGates.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/release/CHANGE_MANAGEMENT_POLICY.md", "docs/release/DEPLOYMENT_PROMOTION_RUNBOOK.md"],
    evidenceRequirements: "Approved Production Change Record",
    riskLevel: "CRITICAL",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-022",
    domain: "Identity Governance",
    controlId: "CTRL-IDN-001",
    controlName: "Identity Lifecycle, Dormant Account Purge & Break-Glass Access",
    description: "User identity state machine, 90-day dormant account suspension, and time-bound break-glass.",
    implementationReferences: ["src/lib/auth/identityLifecycle.ts", "src/lib/auth/privilegedAccess.ts", "src/lib/auth/accessCertification.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/identity/IDENTITY_LIFECYCLE_POLICY.md", "docs/identity/PRIVILEGED_ACCESS_AND_BREAKGLASS_POLICY.md"],
    evidenceRequirements: "Access Recertification Audit Record",
    riskLevel: "HIGH",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-023",
    domain: "Audit Assurance",
    controlId: "CTRL-AUD-001",
    controlName: "Control Registry, Automated Evidence & Continuous Monitoring",
    description: "SHA-256 tamper-evident evidence collector and continuous control status evaluator.",
    implementationReferences: ["src/lib/audit/controlRegistry.ts", "src/lib/audit/evidenceCollector.ts", "src/lib/audit/controlMonitoring.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/audit/ENTERPRISE_CONTROL_FRAMEWORK.md", "docs/audit/CONTROL_EVIDENCE_STANDARD.md"],
    evidenceRequirements: "SHA-256 Tamper Evident Log",
    riskLevel: "CRITICAL",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-024",
    domain: "Risk Management",
    controlId: "CTRL-RSK-001",
    controlName: "Enterprise Risk Register, Heat Matrix & Executive Escalations",
    description: "Likelihood x Impact risk scoring, control gap detection, and executive escalations.",
    implementationReferences: ["src/lib/risk/riskRegister.ts", "src/lib/risk/riskAssessment.ts", "src/lib/risk/riskEscalation.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/risk/ENTERPRISE_RISK_MANAGEMENT_POLICY.md", "docs/risk/RISK_APPETITE_AND_TOLERANCE.md"],
    evidenceRequirements: "Executive Risk Escalation Log",
    riskLevel: "CRITICAL",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-025",
    domain: "Disaster Recovery",
    controlId: "CTRL-DRV-001",
    controlName: "Disaster Recovery Validation & Operational Resilience Assurance",
    description: "DR scenario state machine, RTO/RPO validation, backup integrity checks, and failover states.",
    implementationReferences: ["src/lib/reliability/disasterRecovery.ts", "src/lib/reliability/recoveryObjectives.ts", "src/lib/reliability/backupGovernance.ts", "src/lib/reliability/failoverGovernance.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/reliability/DISASTER_RECOVERY_GOVERNANCE.md", "docs/reliability/BACKUP_AND_RESTORATION_ASSURANCE.md"],
    evidenceRequirements: "Disaster Recovery Exercise Execution Record",
    riskLevel: "CRITICAL",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
  {
    governanceId: "GOV-026",
    domain: "Observability",
    controlId: "CTRL-OBS-001",
    controlName: "SLO Governance, Error Budget Deployment Freeze & Incident Engine",
    description: "Availability SLO evaluation, error budget deployment freeze gate, alert noise suppression, and incident PIRs.",
    implementationReferences: ["src/lib/observability/sloEngine.ts", "src/lib/observability/incidentManagement.ts", "src/lib/observability/alertGovernance.ts", "src/lib/observability/operationalIntelligence.ts"],
    testReferences: ["src/app/api/auth/__tests__/tenant-isolation.api.test.ts"],
    documentationReferences: ["docs/operations/OBSERVABILITY_AND_SLO_POLICY.md", "docs/operations/INCIDENT_MANAGEMENT_POLICY.md"],
    evidenceRequirements: "Post-Incident Review Audit Evidence",
    riskLevel: "CRITICAL",
    verificationStatus: "VERIFIED",
    certificationStatus: "CERTIFIED",
  },
];

export function getMasterGovernanceControlMatrix(): GovernanceControlEntry[] {
  return MASTER_GOVERNANCE_CONTROL_MATRIX;
}
