import { ENTERPRISE_RISK_REGISTER, RiskDefinition } from "./riskRegister";

export type RiskHeatLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export function calculateRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

export function classifyRiskHeat(score: number): RiskHeatLevel {
  if (score >= 20) return "CRITICAL";
  if (score >= 15) return "HIGH";
  if (score >= 6) return "MEDIUM";
  return "LOW";
}

export interface EvaluatedRiskReport {
  riskId: string;
  category: string;
  description: string;
  inherentScore: number;
  inherentHeat: RiskHeatLevel;
  residualScore: number;
  residualHeat: RiskHeatLevel;
  hasControlGaps: boolean;
}

export function evaluateEnterpriseRisks(): EvaluatedRiskReport[] {
  return ENTERPRISE_RISK_REGISTER.map((risk) => {
    const inherentScore = calculateRiskScore(risk.inherentLikelihood, risk.inherentImpact);
    const residualScore = calculateRiskScore(risk.residualLikelihood, risk.residualImpact);

    return {
      riskId: risk.riskId,
      category: risk.category,
      description: risk.description,
      inherentScore,
      inherentHeat: classifyRiskHeat(inherentScore),
      residualScore,
      residualHeat: classifyRiskHeat(residualScore),
      hasControlGaps: !risk.mitigatingControlIds || risk.mitigatingControlIds.length === 0,
    };
  });
}
