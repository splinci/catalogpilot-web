export type RiskCategory = "Security" | "Availability" | "Financial" | "Compliance" | "Privacy" | "AI_Safety";
export type RiskStatus = "IDENTIFIED" | "ASSESSED" | "MITIGATING" | "MONITORED" | "ACCEPTED" | "CLOSED";

export interface RiskDefinition {
  riskId: string;
  category: RiskCategory;
  description: string;
  owner: string;
  inherentLikelihood: number; // 1 - 5
  inherentImpact: number;     // 1 - 5
  residualLikelihood: number; // 1 - 5
  residualImpact: number;   // 1 - 5
  status: RiskStatus;
  treatmentPlan: string;
  mitigatingControlIds: string[];
}

export const ENTERPRISE_RISK_REGISTER: RiskDefinition[] = [
  {
    riskId: "RISK-SEC-01",
    category: "Security",
    description: "Cross-tenant data exposure via API boundary vulnerability",
    owner: "CISO",
    inherentLikelihood: 4,
    inherentImpact: 5,
    residualLikelihood: 1,
    residualImpact: 5,
    status: "MONITORED",
    treatmentPlan: "Zero-Trust request context evaluation and tenant query isolation guards",
    mitigatingControlIds: ["CTRL-SEC-001"],
  },
  {
    riskId: "RISK-FIN-01",
    category: "Financial",
    description: "Unauthorized backdated transaction mutations in closed accounting periods",
    owner: "VP Finance",
    inherentLikelihood: 3,
    inherentImpact: 4,
    residualLikelihood: 1,
    residualImpact: 4,
    status: "MONITORED",
    treatmentPlan: "Immutable financial audit ledger and period lock validation",
    mitigatingControlIds: ["CTRL-FIN-001"],
  },
  {
    riskId: "RISK-AIG-01",
    category: "AI_Safety",
    description: "Prompt injection or unapproved AI model execution bypassing controls",
    owner: "Head of AI",
    inherentLikelihood: 4,
    inherentImpact: 4,
    residualLikelihood: 1,
    residualImpact: 3,
    status: "MONITORED",
    treatmentPlan: "Model registry validation and prompt injection pattern detection filters",
    mitigatingControlIds: ["CTRL-AIG-001"],
  },
  {
    riskId: "RISK-REL-01",
    category: "Availability",
    description: "Infrastructure database timeout or worker thread pool starvation",
    owner: "VP Infrastructure",
    inherentLikelihood: 4,
    inherentImpact: 4,
    residualLikelihood: 2,
    residualImpact: 3,
    status: "MONITORED",
    treatmentPlan: "Bulkhead concurrency policies, circuit breakers, and chaos failure testing",
    mitigatingControlIds: ["CTRL-REL-001"],
  },
  {
    riskId: "RISK-CHG-01",
    category: "Compliance",
    description: "Unapproved production change deployment bypassing release gates",
    owner: "Head of Release Management",
    inherentLikelihood: 3,
    inherentImpact: 5,
    residualLikelihood: 1,
    residualImpact: 4,
    status: "MONITORED",
    treatmentPlan: "Segregation of duties approval enforcer and automated deployment promotion gates",
    mitigatingControlIds: ["CTRL-CHG-001"],
  },
];

export function getRiskRegister(): RiskDefinition[] {
  return ENTERPRISE_RISK_REGISTER;
}
