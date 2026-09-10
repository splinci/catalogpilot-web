/**
 * ============================================================================
 * Atlas Commerce OS — Customer Domain Service
 * ============================================================================
 * Specification Reference: CRM-002 / BSD-006 / M7-001
 * Domain: Customer Management Business Logic & Outbox Event Orchestration
 * ============================================================================
 */

import { customerRepository, CustomerRepository } from "@/repositories/customer.repository";
import { customerPolicy, CustomerPolicy } from "./customer.policy";
import { auditService, AuditService } from "../audit.service";
import { UserSessionPayload } from "@/types/auth.dto";
import { CreateAddressInput, CreateContactInput, CreateCustomerInput, UpdateCustomerInput } from "@/types/crm.dto";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class CustomerService {
  constructor(
    private customerRepo: CustomerRepository = customerRepository,
    private policy: CustomerPolicy = customerPolicy,
    private audit: AuditService = auditService
  ) {}

  /**
   * Create a new Customer aggregate.
   */
  async createCustomer(session: UserSessionPayload, input: CreateCustomerInput) {
    this.policy.validateCustomerCreation(input);

    const customer = await this.customerRepo.create(session.companyId, input, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "CustomerCreated",
        payload: {
          customerId: customer.id,
          customerCode: customer.customerCode,
          legalName: customer.legalName,
          email: customer.email,
          createdAt: customer.createdAt.toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.USER_CREATED,
      entityName: "Customer",
      entityId: customer.id,
      details: {
        customerCode: customer.customerCode,
        legalName: customer.legalName,
      },
    });

    return customer;
  }

  /**
   * Update existing Customer aggregate.
   */
  async updateCustomer(session: UserSessionPayload, customerId: string, input: UpdateCustomerInput) {
    this.policy.validateCustomerUpdate(input);

    const updated = await this.customerRepo.update(session.companyId, customerId, input, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "CustomerUpdated",
        payload: {
          customerId: updated.id,
          legalName: updated.legalName,
          updatedAt: updated.updatedAt.toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.USER_UPDATED,
      entityName: "Customer",
      entityId: updated.id,
      details: {
        legalName: updated.legalName,
      },
    });

    return updated;
  }

  /**
   * Update Customer credit terms and hold status.
   */
  async updateCreditStatus(session: UserSessionPayload, customerId: string, creditLimit: number, creditHold: boolean) {
    this.policy.validateCreditUpdate(creditLimit);

    const updated = await this.customerRepo.updateCreditStatus(
      session.companyId,
      customerId,
      creditLimit,
      creditHold,
      session.userId
    );

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "CustomerCreditUpdated",
        payload: {
          customerId: updated.id,
          creditLimit,
          creditHold,
          updatedAt: new Date().toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.USER_UPDATED,
      entityName: "Customer",
      entityId: updated.id,
      details: {
        creditLimit,
        creditHold,
      },
    });

    return updated;
  }

  /**
   * Add contact person to Customer aggregate.
   */
  async addContact(session: UserSessionPayload, customerId: string, input: CreateContactInput) {
    const customer = await this.customerRepo.findById(session.companyId, customerId);
    if (!customer) {
      throw new Error("Customer not found or access denied");
    }

    const contact = await prisma.customerContact.create({
      data: {
        customerId,
        name: `${input.firstName} ${input.lastName}`,
        email: input.email,
        phone: input.phone,
        role: input.isPrimary ? "Primary Contact" : "Secondary Contact",
      },
    });

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "CustomerContactUpdated",
        payload: {
          customerId,
          contactId: contact.id,
          name: contact.name,
          email: contact.email,
        },
      },
    });

    return contact;
  }

  /**
   * Add billing or shipping address to Customer aggregate.
   */
  async addAddress(session: UserSessionPayload, customerId: string, input: CreateAddressInput) {
    const customer = await this.customerRepo.findById(session.companyId, customerId);
    if (!customer) {
      throw new Error("Customer not found or access denied");
    }

    const address = await prisma.customerAddress.create({
      data: {
        customerId,
        addressType: input.type,
        street: input.street2 ? `${input.street1}, ${input.street2}` : input.street1,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        isDefault: input.isDefault,
      },
    });

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "CustomerAddressUpdated",
        payload: {
          customerId,
          addressId: address.id,
          addressType: address.addressType,
          postalCode: address.postalCode,
        },
      },
    });

    return address;
  }

  /**
   * Soft delete Customer aggregate after checking archive eligibility.
   */
  async archiveCustomer(session: UserSessionPayload, customerId: string) {
    const customer = await this.customerRepo.findById(session.companyId, customerId);
    if (!customer) {
      throw new Error("Customer not found or access denied");
    }

    const openOrdersCount = customer.orders.filter(
      (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
    ).length;

    this.policy.validateArchiveEligibility(openOrdersCount);

    const archived = await this.customerRepo.archive(session.companyId, customerId, session.userId);

    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: "CustomerArchived",
        payload: {
          customerId: archived.id,
          archivedAt: new Date().toISOString(),
        },
      },
    });

    return archived;
  }
}

export const customerService = new CustomerService();
