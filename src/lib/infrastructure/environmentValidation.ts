export interface EnvironmentConfigReport {
  status: "VERIFIED" | "INVALID";
  nodeEnv: string;
  isProduction: boolean;
  missingRequiredVariables: string[];
  validatedVariables: string[];
}

export function validateProductionEnvironmentConfig(env: Record<string, string | undefined> = process.env): EnvironmentConfigReport {
  const nodeEnv = env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";

  const requiredProductionVars = [
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
    "ENCRYPTION_SECRET",
    "WEBHOOK_HMAC_SECRET",
  ];

  const missingRequiredVariables: string[] = [];
  const validatedVariables: string[] = [];

  for (const varName of requiredProductionVars) {
    if (!env[varName]) {
      if (isProduction) {
        missingRequiredVariables.push(varName);
      }
    } else {
      validatedVariables.push(varName);
    }
  }

  return {
    status: missingRequiredVariables.length === 0 ? "VERIFIED" : "INVALID",
    nodeEnv,
    isProduction,
    missingRequiredVariables,
    validatedVariables,
  };
}
