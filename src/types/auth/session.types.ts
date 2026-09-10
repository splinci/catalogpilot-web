export interface CreateSessionDto {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  }
  
  export interface SessionValidationResult {
    sessionId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }