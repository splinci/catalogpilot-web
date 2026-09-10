/**
 * ============================================================================
 * Atlas Commerce OS — Customer Policy Engine
 * ============================================================================
 * Specification Reference: CRM-002 / BSD-006 / M7-001
 * Domain: CRM Credit Terms, Archive Rules & Validation Engine
 * ============================================================================
 */

import { CreateCustomerInput, UpdateCustomerInput } from "@/types/crm.dto";

export class CustomerPolicy {
  /**
   * Validate customer creation input data.
   */
  validateCustomerCreation(input: CreateCustomerInput): void {
    if (!input.legalName || input.legalName.trim().length < 2) {
      throw new Error("Customer legal name must be at least 2 characters long");
    }

    if (input.creditLimit < 0) {
      throw new Error("Customer credit limit cannot be negative");
    }
  }

  /**
   * Validate customer update input data.
   */
  validateCustomerUpdate(input: UpdateCustomerInput): void {
    if (input.legalName !== undefined && input.legalName.trim().length < 2) {
      throw new Error("Customer legal name must be at least 2 characters long");
    }

    if (input.creditLimit !== undefined && input.creditLimit < 0) {
      throw new Error("Customer credit limit cannot be negative");
    }
  }

  /**
   * Validate credit status and limit update.
   */
  validateCreditUpdate(creditLimit: number): void {
    if (creditLimit < 0) {
      throw new Error("Customer credit limit cannot be negative");
    }
  }

  /**
   * Validate archive eligibility (e.g. check if customer has active open orders).
   */
  validateArchiveEligibility(openOrdersCount: number): void {
    if (openOrdersCount > 0) {
      throw new Error(`Cannot archive customer with ${openOrdersCount} active open sales orders`);
    }
  }
}

export const customerPolicy = new CustomerPolicy();
