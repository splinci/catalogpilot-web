import { getFieldClassification } from "../governance/dataClassification";

export function sanitizePayloadForAi(payload: Record<string, any>, domain: string): Record<string, any> {
  const sanitized = { ...payload };

  for (const [key, value] of Object.entries(payload)) {
    const classification = getFieldClassification(domain, key);

    if (classification === "RESTRICTED") {
      throw new Error(`RESTRICTED_DATA_PROHIBITED: Field '${key}' classified as RESTRICTED cannot be transmitted to AI models.`);
    }

    if (classification === "CONFIDENTIAL" && typeof value === "string") {
      sanitized[key] = "[REDACTED_CONFIDENTIAL_DATA]";
    }
  }

  return sanitized;
}
