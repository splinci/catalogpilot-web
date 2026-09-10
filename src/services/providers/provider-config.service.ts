/**
 * ============================================================================
 * Splinci Commerce OS — Centralized Provider Configuration Service
 * ============================================================================
 * Specification Reference: PROVIDER-001 / SEC-001 / ENG-001
 * Domain: Server-Side External Production Provider Configuration & Readiness
 * ============================================================================
 */

export type ProviderStatus = "CONFIGURED" | "NOT_CONFIGURED" | "ENVIRONMENT_LIMITATION";

export interface ProviderConfigSummary {
  payment: { status: ProviderStatus; providerName: string; sandboxAvailable: boolean };
  carrier: { status: ProviderStatus; providerName: string; sandboxAvailable: boolean };
  email: { status: ProviderStatus; providerName: string; sandboxAvailable: boolean };
  ai: { status: ProviderStatus; providerName: string; sandboxAvailable: boolean };
  tax: { status: ProviderStatus; providerName: string; sandboxAvailable: boolean };
  environment: string;
}

export class ProviderConfigService {
  /**
   * Safe server-side provider status inspection (0 secrets exposed).
   */
  static getProviderSummary(envOverride?: string): ProviderConfigSummary {
    const env = envOverride || process.env.NODE_ENV || "development";
    const isProd = env === "production";

    const hasPaymentKey = Boolean(process.env.STRIPE_SECRET_KEY || process.env.AUTHORIZENET_API_KEY);
    const hasCarrierKey = Boolean(process.env.FEDEX_API_KEY || process.env.UPS_LICENSE_KEY);
    const hasEmailKey = Boolean(
      (process.env.SMTP_HOST && (process.env.SMTP_PASS || process.env.SMTP_PASSWORD)) ||
      process.env.SENDGRID_API_KEY
    );
    const hasAIKey = Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
    const hasTaxKey = Boolean(process.env.AVALARA_ACCOUNT_ID || process.env.TAXJAR_API_KEY);

    return {
      payment: {
        status: hasPaymentKey ? "CONFIGURED" : (isProd ? "ENVIRONMENT_LIMITATION" : "NOT_CONFIGURED"),
        providerName: hasPaymentKey ? "Stripe Gateway" : "MockPaymentProvider",
        sandboxAvailable: true,
      },
      carrier: {
        status: hasCarrierKey ? "CONFIGURED" : (isProd ? "ENVIRONMENT_LIMITATION" : "NOT_CONFIGURED"),
        providerName: hasCarrierKey ? "FedEx Carrier API" : "InternalDispatchEngine",
        sandboxAvailable: true,
      },
      email: {
        status: hasEmailKey ? "CONFIGURED" : (isProd ? "ENVIRONMENT_LIMITATION" : "NOT_CONFIGURED"),
        providerName: hasEmailKey ? "SMTP / SendGrid" : "TransactionalOutboxEngine",
        sandboxAvailable: true,
      },
      ai: {
        status: hasAIKey ? "CONFIGURED" : (isProd ? "ENVIRONMENT_LIMITATION" : "NOT_CONFIGURED"),
        providerName: hasAIKey ? "OpenAI LLM API" : "InternalAIEnrichmentPolicy",
        sandboxAvailable: true,
      },
      tax: {
        status: hasTaxKey ? "CONFIGURED" : (isProd ? "ENVIRONMENT_LIMITATION" : "NOT_CONFIGURED"),
        providerName: hasTaxKey ? "Avalara Tax Engine" : "InternalTaxPolicyEngine",
        sandboxAvailable: true,
      },
      environment: env,
    };
  }

  /**
   * Validate that production mode fails explicitly if critical credentials are missing.
   */
  static validateProductionConfig(providerType: "payment" | "carrier" | "email" | "ai" | "tax"): boolean {
    const summary = this.getProviderSummary("production");
    const target = summary[providerType];

    if (target.status === "ENVIRONMENT_LIMITATION" || target.status === "NOT_CONFIGURED") {
      throw new Error(`Production Provider Error: ${providerType} credentials are not configured in production environment.`);
    }

    return true;
  }
}
