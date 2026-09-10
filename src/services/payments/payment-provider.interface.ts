/**
 * ============================================================================
 * Splinci Commerce OS — Payment Provider Abstraction Layer
 * ============================================================================
 * Specification Reference: E2E-006 / FIN-003 / SEC-001
 * Domain: External Payment Gateway Abstraction & Provider Isolation
 * ============================================================================
 */

export interface PaymentAuthorizeInput {
  salesOrderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  idempotencyKey?: string;
}

export interface PaymentAuthorizeResult {
  success: boolean;
  authorizationId: string;
  status: "AUTHORIZED" | "FAILED";
  errorCode?: string;
  errorMessage?: string;
  timestamp: string;
}

export interface PaymentCaptureInput {
  authorizationId: string;
  amount: number;
  idempotencyKey?: string;
}

export interface PaymentCaptureResult {
  success: boolean;
  captureId: string;
  status: "CAPTURED" | "FAILED";
  capturedAmount: number;
  timestamp: string;
}

export interface PaymentVoidInput {
  authorizationId: string;
  reason?: string;
}

export interface PaymentVoidResult {
  success: boolean;
  status: "VOIDED" | "FAILED";
  timestamp: string;
}

export interface PaymentRefundInput {
  captureId: string;
  amount: number;
  reason?: string;
  idempotencyKey?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  refundId: string;
  status: "REFUNDED" | "FAILED";
  refundedAmount: number;
  timestamp: string;
}

export interface PaymentProvider {
  authorize(input: PaymentAuthorizeInput): Promise<PaymentAuthorizeResult>;
  capture(input: PaymentCaptureInput): Promise<PaymentCaptureResult>;
  void(input: PaymentVoidInput): Promise<PaymentVoidResult>;
  refund(input: PaymentRefundInput): Promise<PaymentRefundResult>;
}

export class MockPaymentProvider implements PaymentProvider {
  async authorize(input: PaymentAuthorizeInput): Promise<PaymentAuthorizeResult> {
    if (input.amount <= 0) {
      return {
        success: false,
        authorizationId: "",
        status: "FAILED",
        errorCode: "INVALID_AMOUNT",
        errorMessage: "Authorization amount must be positive",
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      authorizationId: `AUTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "AUTHORIZED",
      timestamp: new Date().toISOString(),
    };
  }

  async capture(input: PaymentCaptureInput): Promise<PaymentCaptureResult> {
    if (input.amount <= 0) {
      return {
        success: false,
        captureId: "",
        status: "FAILED",
        capturedAmount: 0,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      captureId: `CAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "CAPTURED",
      capturedAmount: input.amount,
      timestamp: new Date().toISOString(),
    };
  }

  async void(input: PaymentVoidInput): Promise<PaymentVoidResult> {
    return {
      success: true,
      status: "VOIDED",
      timestamp: new Date().toISOString(),
    };
  }

  async refund(input: PaymentRefundInput): Promise<PaymentRefundResult> {
    if (input.amount <= 0) {
      return {
        success: false,
        refundId: "",
        status: "FAILED",
        refundedAmount: 0,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      refundId: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: "REFUNDED",
      refundedAmount: input.amount,
      timestamp: new Date().toISOString(),
    };
  }
}

export const mockPaymentProvider = new MockPaymentProvider();
