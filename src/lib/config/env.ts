import { logger } from "@/lib/observability/logger";

export interface EnvValidationResult {
  isValid: boolean;
  environment: string;
  missing: string[];
}

export function validateEnvironmentConfig(): EnvValidationResult {
  const env = process.env.NODE_ENV || "development";
  const requiredInProduction = ["DATABASE_URL", "JWT_SECRET"];
  const missing: string[] = [];

  for (const key of requiredInProduction) {
    if (!process.env[key] && env === "production") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    logger.error(`Critical configuration validation failed: missing environment variables`, {
      errorCode: "ENV_VALIDATION_FAILED",
      missing,
    });
  }

  return {
    isValid: missing.length === 0,
    environment: env,
    missing,
  };
}

export function getEnvironmentConfig() {
  const validation = validateEnvironmentConfig();
  return {
    ...validation,
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Splinci Commerce OS",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.splinci.com",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
  };
}
