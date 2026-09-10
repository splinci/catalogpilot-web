import type { CreateProductDto } from "../dto/create-product.dto";
import type { UpdateProductDto } from "../dto/update-product.dto";
import type { InventoryStatsDto } from "../dto/inventory-stats.dto";

import { productRepository } from "../repositories/product.repository";
import { toProductDto } from "../mappers/product.mapper";

import {
  createProductSchema,
  updateProductSchema,
} from "@/features/inventory/validators/ProductValidator";

export class ProductService {
  async getProducts(companyId: string) {
    const products = await productRepository.findAll(companyId);
    return products.map(toProductDto);
  }

  async getProductById(id: string, companyId?: string) {
    const product = await productRepository.findById(id, companyId);

    if (!product) {
      throw new Error("Product not found.");
    }

    return toProductDto(product);
  }

  async createProduct(companyId: string, data: CreateProductDto) {
    const validated = createProductSchema.parse(data);

    const existingSku = await productRepository.findBySku(
      companyId,
      validated.sku
    );

    if (existingSku) {
      throw new Error(
        `SKU "${validated.sku}" already exists.`
      );
    }

    const product = await productRepository.create(companyId, validated);

    return toProductDto(product);
  }

  async updateProduct(
    id: string,
    companyId: string,
    data: UpdateProductDto
  ) {
    await this.getProductById(id, companyId);

    const validated = updateProductSchema.parse(data);

    if (validated.sku) {
      const existingSku = await productRepository.findBySku(
        companyId,
        validated.sku
      );

      if (
        existingSku &&
        existingSku.id !== id
      ) {
        throw new Error(
          `SKU "${validated.sku}" already exists.`
        );
      }
    }

    const updated = await productRepository.update(
      id,
      companyId,
      validated
    );

    return toProductDto(updated);
  }

  async archiveProduct(id: string, companyId: string) {
    await this.getProductById(id, companyId);

    const archived = await productRepository.archive(id, companyId);

    return toProductDto(archived);
  }

  async getInventoryStats(companyId: string): Promise<InventoryStatsDto> {
    return productRepository.getInventoryStats(companyId);
  }
}

export const productService = new ProductService();