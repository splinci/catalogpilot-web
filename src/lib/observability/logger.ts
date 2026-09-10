export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogContext {
  requestId?: string;
  companyId?: string;
  userId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  errorCode?: string;
  [key: string]: any;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "secret",
  "jwt",
  "cookie",
  "authorization",
  "databaseurl",
  "db_password",
]);

export function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    if (obj.toLowerCase().includes("bearer ") || obj.toLowerCase().includes("postgres://")) {
      return "[REDACTED_SECRET]";
    }
    return obj;
  }

  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = redactSensitiveData(val);
    }
  }
  return sanitized;
}

class StructuredLogger {
  private formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? redactSensitiveData(context) : {};

    return {
      timestamp,
      level,
      message,
      ...sanitizedContext,
    };
  }

  private safeWrite(level: LogLevel, payload: Record<string, any>) {
    try {
      const jsonString = JSON.stringify(payload);
      if (level === "ERROR") {
        console.error(jsonString);
      } else if (level === "WARN") {
        console.warn(jsonString);
      } else if (level === "DEBUG") {
        if (process.env.NODE_ENV !== "production") {
          console.debug(jsonString);
        }
      } else {
        console.log(jsonString);
      }
    } catch {
      // Fallback if JSON serialization fails
      console.log(`[${new Date().toISOString()}] [${level}] ${payload.message || "Log output error"}`);
    }
  }

  debug(message: string, context?: LogContext) {
    const payload = this.formatLog("DEBUG", message, context);
    this.safeWrite("DEBUG", payload);
  }

  info(message: string, context?: LogContext) {
    const payload = this.formatLog("INFO", message, context);
    this.safeWrite("INFO", payload);
  }

  warn(message: string, context?: LogContext) {
    const payload = this.formatLog("WARN", message, context);
    this.safeWrite("WARN", payload);
  }

  error(message: string, context?: LogContext) {
    const payload = this.formatLog("ERROR", message, context);
    this.safeWrite("ERROR", payload);
  }
}

export const logger = new StructuredLogger();
