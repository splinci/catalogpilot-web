export type BusinessCriticality = "NON_CRITICAL" | "IMPORTANT" | "BUSINESS_CRITICAL" | "MISSION_CRITICAL";

export interface WorkflowImpactAssessment {
  workflowName: string;
  criticality: BusinessCriticality;
  targetRTOSeconds: number;
  targetRPOSeconds: number;
}

export function evaluateWorkflowCriticality(criticality: BusinessCriticality): WorkflowImpactAssessment {
  switch (criticality) {
    case "MISSION_CRITICAL":
      return { workflowName: "Core Transactions", criticality, targetRTOSeconds: 300, targetRPOSeconds: 60 };
    case "BUSINESS_CRITICAL":
      return { workflowName: "Order Processing", criticality, targetRTOSeconds: 900, targetRPOSeconds: 300 };
    case "IMPORTANT":
      return { workflowName: "Catalog Publishing", criticality, targetRTOSeconds: 3600, targetRPOSeconds: 1800 };
    default:
      return { workflowName: "Reporting Analytics", criticality: "NON_CRITICAL", targetRTOSeconds: 86400, targetRPOSeconds: 86400 };
  }
}
