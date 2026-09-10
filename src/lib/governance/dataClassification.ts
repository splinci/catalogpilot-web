export type DataClassificationTier = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export interface FieldClassification {
  domain: string;
  field: string;
  tier: DataClassificationTier;
  pii: boolean;
  description: string;
}

export const DATA_CLASSIFICATION_REGISTRY: FieldClassification[] = [
  // User & Identity Domain
  { domain: "User", field: "email", tier: "RESTRICTED", pii: true, description: "User email address" },
  { domain: "User", field: "firstName", tier: "CONFIDENTIAL", pii: true, description: "User first name" },
  { domain: "User", field: "lastName", tier: "CONFIDENTIAL", pii: true, description: "User last name" },
  { domain: "User", field: "passwordHash", tier: "RESTRICTED", pii: false, description: "Argon2 password hash" },

  // API Credentials
  { domain: "ApiKey", field: "rawKey", tier: "RESTRICTED", pii: false, description: "Raw API Key token (Never stored at rest)" },
  { domain: "ApiKey", field: "keyHash", tier: "RESTRICTED", pii: false, description: "SHA-256 API Key hash" },

  // Integration Credentials
  { domain: "Integration", field: "credentialsEncrypted", tier: "RESTRICTED", pii: false, description: "Encrypted third-party API credentials" },

  // Catalog Domain
  { domain: "Product", field: "sku", tier: "INTERNAL", pii: false, description: "Product SKU identifier" },
  { domain: "Product", field: "title", tier: "PUBLIC", pii: false, description: "Public product title" },
  { domain: "Product", field: "price", tier: "PUBLIC", pii: false, description: "Selling price" },
  { domain: "Product", field: "costPrice", tier: "CONFIDENTIAL", pii: false, description: "Product wholesale cost price" },

  // Operational Logs & Security
  { domain: "AuditLog", field: "details", tier: "CONFIDENTIAL", pii: false, description: "Audit trail transaction details" },
  { domain: "SecurityEvent", field: "ipAddress", tier: "CONFIDENTIAL", pii: true, description: "Client IP address" },
];

export function getFieldClassification(domain: string, field: string): DataClassificationTier {
  const found = DATA_CLASSIFICATION_REGISTRY.find(
    (item) => item.domain.toLowerCase() === domain.toLowerCase() && item.field.toLowerCase() === field.toLowerCase()
  );
  return found ? found.tier : "INTERNAL";
}
