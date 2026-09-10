export type AiProvider = "GOOGLE_VERTEX" | "ANTHROPIC" | "OPENAI" | "INTERNAL_MODEL";

export type AiCapability = "TEXT_GENERATION" | "EMBEDDING" | "STRUCTURED_EXTRACTION" | "VISION";

export interface ApprovedAiModel {
  provider: AiProvider;
  modelIdentifier: string;
  modelVersion: string;
  allowedCapabilities: AiCapability[];
  allowedDataClassifications: ("PUBLIC" | "INTERNAL" | "CONFIDENTIAL")[];
  maxTokenLimit: number;
  timeoutMs: number;
  retryLimit: number;
  costLimitPerRequestCents: number;
  enabled: boolean;
}

export type AiActionRiskLevel = "LOW_RISK" | "MEDIUM_RISK" | "HIGH_RISK" | "CRITICAL_RISK";
