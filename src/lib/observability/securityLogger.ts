import { logger, LogContext } from "./logger";

export const securityLogger = {
  logAuthFailure(email: string, reason: string, context?: LogContext) {
    logger.warn(`Security Event: Authentication failed for ${email} (${reason})`, {
      ...context,
      errorCode: "AUTH_FAILURE",
      emailRedacted: email.replace(/(?<=^.{2}).*(?=@)/, "***"),
    });
  },

  logAccessDenied(userId: string, role: string, requiredPermission: string, context?: LogContext) {
    logger.warn(`Security Event: Access denied for user ${userId} (Role: ${role}, Required: ${requiredPermission})`, {
      ...context,
      userId,
      role,
      requiredPermission,
      errorCode: "ACCESS_DENIED",
    });
  },

  logRateLimitExceeded(identifier: string, route: string, context?: LogContext) {
    logger.warn(`Security Event: Rate limit threshold exceeded for ${identifier} on ${route}`, {
      ...context,
      route,
      errorCode: "RATE_LIMIT_EXCEEDED",
    });
  },

  logCrossTenantAttempt(userId: string, tenantId: string, targetTenantId: string, context?: LogContext) {
    logger.error(`Security Event: Cross-tenant access attempt blocked! User ${userId} (${tenantId}) -> Target ${targetTenantId}`, {
      ...context,
      userId,
      companyId: tenantId,
      targetTenantId,
      errorCode: "CROSS_TENANT_VIOLATION",
    });
  },

  logStateTransitionViolation(entity: string, currentStatus: string, targetStatus: string, context?: LogContext) {
    logger.warn(`Governance Event: Invalid ${entity} status transition attempt: ${currentStatus} -> ${targetStatus}`, {
      ...context,
      entity,
      currentStatus,
      targetStatus,
      errorCode: "INVALID_STATE_TRANSITION",
    });
  },
};
