/**
 * ============================================================================
 * Atlas Commerce OS — Customer Policy Engine
 * ============================================================================
 * Specification Reference: CRM-002 / BSD-006 / M7-001
 * Domain: CRM Credit Terms & Policy Rules
 * ============================================================================
 */

import { CreateCustomerInput } from "@/types/crm.dto";

export class CustomerPolicy {
  /**
   * Validate customer creation payload.
   */
  validateCustomerCreation(input: CreateCustomerInput) {
    if (!input.legalName || input.legalName.trim().length < 2) {
      throw new Error("Customer legal name must be at least 2 characters");
    }

    if (input.creditLimit < 0) {
      throw new Error("Customer credit limit cannot be negative");
    }
  }

  /**
   * Validate credit status change.
   */
  validateCreditUpdate(creditLimit: number) {
    if (creditLimit < 0) {
      throw new Error("Credit limit cannot be negative");
    }
  }
}

export const customerPolicy = new CustomerPolicy();
