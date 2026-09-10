export type ControlDomain =
  | "Security"
  | "Identity_Access"
  | "Data_Governance"
  | "Financial_Controls"
  | "AI_Governance"
  | "Reliability"
  | "Change_Management"
  | "Integration_Governance";

export type ControlStatus = "COMPLIANT" | "AT_RISK" | "NON_COMPLIANT" | "NOT_APPLICABLE" | "PENDING_REVIEW";

export interface ControlDefinition {
  controlId: string;
  domain: ControlDomain;
  description: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  controlOwner: string;
  frequency: "CONTINUOUS" | "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";
  evidenceRequirements: string;
  automationLevel: "AUTOMATED" | "SEMI_AUTOMATED" | "MANUAL";
  status: ControlStatus;
}

export const CONTROL_CATALOG: ControlDefinition[] = [
  {
    controlId: "CTRL-SEC-001",
    domain: "Security",
    description: "Zero-Trust Request Context and Multi-Tenant Isolation Enforcement",
    risk: "CRITICAL",
    controlOwner: "Security Lead",
    frequency: "CONTINUOUS",
    evidenceRequirements: "Automated Vitest Security Suite Execution Evidence",
    automationLevel: "AUTOMATED",
    status: "COMPLIANT",
  },
  {
    controlId: "CTRL-IDN-001",
    domain: "Identity_Access",
    description: "User Identity Lifecycle & Quarterly Access Recertification",
    risk: "HIGH",
    controlOwner: "IAM Lead",
    frequency: "QUARTERLY",
    evidenceRequirements: "Access Certification Review Audit Record",
    automationLevel: "AUTOMATED",
    status: "COMPLIANT",
  },
  {
    controlId: "CTRL-DAT-001",
    domain: "Data_Governance",
    description: "Data Classification, PII Redaction & Automated Purge",
    risk: "HIGH",
    controlOwner: "Data Privacy Officer",
    frequency: "DAILY",
    evidenceRequirements: "Purge Execution Telemetry Log",
    automationLevel: "AUTOMATED",
    status: "COMPLIANT",
  },
  {
    controlId: "CTRL-FIN-001",
    domain: "Financial_Controls",
    description: "Monetary Precision, Invoice State Machine & Accounting Period Close",
    risk: "CRITICAL",
    controlOwner: "Financial Controller",
    frequency: "CONTINUOUS",
    evidenceRequirements: "Immutable Financial Audit Ledger Event",
    automationLevel: "AUTOMATED",
    status: "COMPLIANT",
  },
  {
    controlId: "CTRL-AIG-001",
    domain: "AI_Governance",
    description: "Approved AI Model Registry & Prompt Injection Defense",
    risk: "HIGH",
    controlOwner: "AI Safety Architect",
    frequency: "CONTINUOUS",
    evidenceRequirements: "AI Request & Prompt Defense Event Log",
    automationLevel: "AUTOMATED",
    status: "COMPLIANT",
  },
  {
    controlId: "CTRL-REL-001",
    domain: "Reliability",
    description: "Chaos Resilience, Bulkhead Guards & Business Continuity",
    risk: "HIGH",
    controlOwner: "SRE Lead",
    frequency: "MONTHLY",
    evidenceRequirements: "Chaos Simulation Test Execution Log",
    automationLevel: "AUTOMATED",
    status: "COMPLIANT",
  },
  {
    controlId: "CTRL-CHG-001",
    domain: "Change_Management",
    description: "Segregation of Duties and Production Deployment Promotion Gates",
    risk: "CRITICAL",
    controlOwner: "Release Manager",
    frequency: "CONTINUOUS",
    evidenceRequirements: "Approved Production Change Record & Build Artifact Sign-off",
    automationLevel: "AUTOMATED",
    status: "COMPLIANT",
  },
];

export function getControlCatalog(): ControlDefinition[] {
  return CONTROL_CATALOG;
}
