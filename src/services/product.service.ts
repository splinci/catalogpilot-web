import { productRepository, ProductRepository } from "@/repositories/product.repository";
import { productQualityService, ProductQualityService } from "./product-quality.service";
import { auditService, AuditService } from "./audit.service";
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from "@/types/pim.dto";
import { UserSessionPayload } from "@/types/auth.dto";
import { ProductStatus, AuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ProductService {
  constructor(
    private productRepo: ProductRepository = productRepository,
    private qualityService: ProductQualityService = productQualityService,
    private audit: AuditService = auditService
  ) {}

  async listProducts(session: UserSessionPayload, query: ProductQueryInput) {
    return this.productRepo.findMany(session.companyId, query);
  }

  async getProductById(session: UserSessionPayload, id: string) {
    const product = await this.productRepo.findById(session.companyId, id);
    if (!product) {
      throw new Error("Product not found or access denied");
    }
    const qualityBreakdown = this.qualityService.calculateScore(product);

    return {
      ...product,
      qualityBreakdown,
    };
  }

  async createProduct(session: UserSessionPayload, input: CreateProductInput) {
    const existingSku = await this.productRepo.findBySku(session.companyId, input.sku);
    if (existingSku) {
      throw new Error(`Product SKU '${input.sku}' already exists in your catalog`);
    }

    const qualityBreakdown = this.qualityService.calculateScore(input);

    const product = await this.productRepo.create(
      session.companyId,
      input,
      qualityBreakdown.score,
      session.userId
    );

    // Write Audit Log
    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.PRODUCT_STAGED,
      entityName: "Product",
      entityId: product.id,
      details: { sku: product.sku, title: product.title, qualityScore: qualityBreakdown.score, event: "PRODUCT_CREATED" },
    });

    return {
      ...product,
      qualityBreakdown,
    };
  }

  async updateProduct(session: UserSessionPayload, id: string, input: UpdateProductInput) {
    const existing = await this.productRepo.findById(session.companyId, id);
    if (!existing) {
      throw new Error("Product not found or access denied");
    }

    if (input.sku && input.sku.toUpperCase() !== existing.sku) {
      const duplicateSku = await this.productRepo.findBySku(session.companyId, input.sku);
      if (duplicateSku) {
        throw new Error(`Product SKU '${input.sku}' already exists in your catalog`);
      }
    }

    const mergedData = { ...existing, ...input };
    const qualityBreakdown = this.qualityService.calculateScore(mergedData);

    const updatedProduct = await this.productRepo.update(
      session.companyId,
      id,
      input,
      qualityBreakdown.score,
      session.userId
    );

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.PRODUCT_STAGED,
      entityName: "Product",
      entityId: id,
      details: { sku: updatedProduct.sku, qualityScore: qualityBreakdown.score, event: "PRODUCT_UPDATED" },
    });

    return {
      ...updatedProduct,
      qualityBreakdown,
    };
  }

  async transitionStatus(session: UserSessionPayload, id: string, targetStatus: ProductStatus, reason?: string) {
    const product = await this.productRepo.findById(session.companyId, id);
    if (!product) {
      throw new Error("Product not found or access denied");
    }

    const qualityBreakdown = this.qualityService.calculateScore(product);

    if (targetStatus === ProductStatus.PUBLISHED && !qualityBreakdown.isPublishable) {
      throw new Error(
        `Product cannot be published. Quality score is ${qualityBreakdown.score}/100 (Minimum required: 80). Missing items: ${qualityBreakdown.missingItems.join(", ")}`
      );
    }

    await this.productRepo.updateStatus(session.companyId, id, targetStatus, session.userId);

    // Emit Outbox Message for Domain Integration
    await prisma.outboxMessage.create({
      data: {
        companyId: session.companyId,
        eventType: `PRODUCT_${targetStatus}`,
        payload: {
          productId: id,
          sku: product.sku,
          status: targetStatus,
          reason,
          timestamp: new Date().toISOString(),
        },
      },
    });

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: targetStatus === ProductStatus.PUBLISHED ? AuditAction.PRODUCT_PUBLISHED : AuditAction.PRODUCT_STAGED,
      entityName: "Product",
      entityId: id,
      details: { previousStatus: product.status, newStatus: targetStatus, reason },
    });

    return this.getProductById(session, id);
  }

  async archiveProduct(session: UserSessionPayload, id: string) {
    const product = await this.productRepo.findById(session.companyId, id);
    if (!product) {
      throw new Error("Product not found or access denied");
    }

    await this.productRepo.softDelete(session.companyId, id, session.userId);

    await this.audit.log({
      companyId: session.companyId,
      userId: session.userId,
      action: AuditAction.PRODUCT_STAGED,
      entityName: "Product",
      entityId: id,
      details: { sku: product.sku, event: "PRODUCT_DELETED" },
    });

    return { success: true, message: `Product ${product.sku} archived successfully` };
  }
}

export const productService = new ProductService();
