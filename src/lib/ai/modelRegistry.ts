import { ApprovedAiModel, AiProvider, AiCapability } from "./types";

export const APPROVED_AI_MODELS: ApprovedAiModel[] = [
  {
    provider: "GOOGLE_VERTEX",
    modelIdentifier: "gemini-1.5-pro",
    modelVersion: "1.5-pro-002",
    allowedCapabilities: ["TEXT_GENERATION", "STRUCTURED_EXTRACTION", "VISION"],
    allowedDataClassifications: ["PUBLIC", "INTERNAL", "CONFIDENTIAL"],
    maxTokenLimit: 8192,
    timeoutMs: 15000,
    retryLimit: 3,
    costLimitPerRequestCents: 50,
    enabled: true,
  },
  {
    provider: "GOOGLE_VERTEX",
    modelIdentifier: "gemini-1.5-flash",
    modelVersion: "1.5-flash-002",
    allowedCapabilities: ["TEXT_GENERATION", "STRUCTURED_EXTRACTION"],
    allowedDataClassifications: ["PUBLIC", "INTERNAL"],
    maxTokenLimit: 4096,
    timeoutMs: 8000,
    retryLimit: 2,
    costLimitPerRequestCents: 10,
    enabled: true,
  },
  {
    provider: "ANTHROPIC",
    modelIdentifier: "claude-3-5-sonnet",
    modelVersion: "20241022",
    allowedCapabilities: ["TEXT_GENERATION", "STRUCTURED_EXTRACTION"],
    allowedDataClassifications: ["PUBLIC", "INTERNAL", "CONFIDENTIAL"],
    maxTokenLimit: 8192,
    timeoutMs: 20000,
    retryLimit: 3,
    costLimitPerRequestCents: 100,
    enabled: true,
  },
  {
    provider: "INTERNAL_MODEL",
    modelIdentifier: "splinci-local-embedder",
    modelVersion: "v1.0",
    allowedCapabilities: ["EMBEDDING"],
    allowedDataClassifications: ["PUBLIC", "INTERNAL", "CONFIDENTIAL"],
    maxTokenLimit: 2048,
    timeoutMs: 5000,
    retryLimit: 2,
    costLimitPerRequestCents: 0,
    enabled: true,
  },
];

export function getApprovedModel(modelIdentifier: string): ApprovedAiModel {
  const model = APPROVED_AI_MODELS.find((m) => m.modelIdentifier === modelIdentifier);
  if (!model) {
    throw new Error(`UNAPPROVED_MODEL: Model '${modelIdentifier}' is not registered in the AI Model Registry.`);
  }
  if (!model.enabled) {
    throw new Error(`DISABLED_MODEL: Model '${modelIdentifier}' is currently disabled by governance policy.`);
  }
  return model;
}

export function validateModelCapability(modelIdentifier: string, capability: AiCapability): void {
  const model = getApprovedModel(modelIdentifier);
  if (!model.allowedCapabilities.includes(capability)) {
    throw new Error(`UNSUPPORTED_CAPABILITY: Model '${modelIdentifier}' does not support capability '${capability}'.`);
  }
}
