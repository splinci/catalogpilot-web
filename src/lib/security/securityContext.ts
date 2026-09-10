export interface SecurityIdentity {
  userId: string;
  companyId: string;
  role: string;
  permissions: string[];
  authType: "SESSION_JWT" | "API_KEY" | "SERVICE_TOKEN";
  keyScopes?: string[];
}

export interface SecurityRequestEnvelope {
  requestId: string;
  route: string;
  method: string;
  clientIp?: string;
  targetCompanyId?: string;
  requiredPermission?: string;
  requiredScope?: string;
}

export interface SecurityContextEvaluation {
  allowed: boolean;
  reason?: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  identity: SecurityIdentity;
}

export function evaluateSecurityContext(
  identity: SecurityIdentity | null,
  envelope: SecurityRequestEnvelope
): SecurityContextEvaluation {
  // 1. Identity & Session Verification
  if (!identity || !identity.userId || !identity.companyId) {
    return {
      allowed: false,
      reason: "UNAUTHENTICATED: Missing or invalid security identity",
      riskLevel: "HIGH",
      identity: identity || { userId: "", companyId: "", role: "", permissions: [], authType: "SESSION_JWT" },
    };
  }

  // 2. Multi-Tenant Boundary Check
  if (envelope.targetCompanyId && envelope.targetCompanyId !== identity.companyId) {
    return {
      allowed: false,
      reason: `CROSS_TENANT_VIOLATION: Identity tenant '${identity.companyId}' attempted access to target tenant '${envelope.targetCompanyId}'`,
      riskLevel: "CRITICAL",
      identity,
    };
  }

  // 3. Capability Permission Check (User Sessions)
  if (envelope.requiredPermission && identity.authType === "SESSION_JWT") {
    const hasPerm =
      identity.role === "ADMIN" ||
      identity.permissions.includes("admin:all") ||
      identity.permissions.includes(envelope.requiredPermission);

    if (!hasPerm) {
      return {
        allowed: false,
        reason: `FORBIDDEN: Identity role '${identity.role}' lacks required permission '${envelope.requiredPermission}'`,
        riskLevel: "HIGH",
        identity,
      };
    }
  }

  // 4. API Credential Scope Check (M2M Keys)
  if (envelope.requiredScope && identity.authType === "API_KEY") {
    const hasScope = identity.keyScopes?.includes(envelope.requiredScope);
    if (!hasScope) {
      return {
        allowed: false,
        reason: `SCOPE_DENIED: API Key lacks required scope '${envelope.requiredScope}'`,
        riskLevel: "HIGH",
        identity,
      };
    }
  }

  return {
    allowed: true,
    riskLevel: "LOW",
    identity,
  };
}
