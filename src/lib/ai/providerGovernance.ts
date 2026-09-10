import { getApprovedModel, validateModelCapability } from "./modelRegistry";
import { AiCapability, ApprovedAiModel } from "./types";

export function enforceAiExecutionGovernance(
  modelIdentifier: string,
  capability: AiCapability,
  requestTokens: number
): ApprovedAiModel {
  const model = getApprovedModel(modelIdentifier);
  validateModelCapability(modelIdentifier, capability);

  if (requestTokens > model.maxTokenLimit) {
    throw new Error(
      `TOKEN_LIMIT_EXCEEDED: Requested tokens (${requestTokens}) exceed model maximum limit (${model.maxTokenLimit}).`
    );
  }

  return model;
}
