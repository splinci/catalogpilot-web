import { evaluateEnterpriseRisks, EvaluatedRiskReport } from "./riskAssessment";

export interface ExecutiveRiskEscalation {
  escalationId: string;
  riskId: string;
  category: string;
  residualHeat: string;
  reason: string;
  escalatedTo: string;
  timestamp: string;
}

const escalationLog: ExecutiveRiskEscalation[] = [];

export function evaluateExecutiveRiskEscalations(): ExecutiveRiskEscalation[] {
  const evaluatedRisks = evaluateEnterpriseRisks();

  for (const report of evaluatedRisks) {
    if (report.residualHeat === "CRITICAL" || report.residualHeat === "HIGH" || report.hasControlGaps) {
      const escalation: ExecutiveRiskEscalation = {
        escalationId: `esc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        riskId: report.riskId,
        category: report.category,
        residualHeat: report.residualHeat,
        reason: report.hasControlGaps
          ? "Unmitigated risk missing required control mapping"
          : `Residual risk heat level is ${report.residualHeat}`,
        escalatedTo: "Executive Governance Committee",
        timestamp: new Date().toISOString(),
      };

      escalationLog.unshift(escalation);
    }
  }

  return escalationLog;
}

export function clearEscalationLog(): void {
  escalationLog.length = 0;
}
