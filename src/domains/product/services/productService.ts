import { productRepository } from "../repositories/productRepository";
import type { CreateProductDto } from "../dto/createProduct.dto";
import type { UpdateProductDto } from "../dto/updateProduct.dto";
import type { ProductFilters } from "../types/productFilters";
import { validateProductStatusTransition } from "../policies/productStatusPolicy";
import { toProduct, toProducts } from "../mappers/product.mapper";

class ProductService {
  async getProducts(companyId: string, filters: ProductFilters = {}) {
    const products = await productRepository.findAll(companyId, filters);
    return toProducts(products);
  }

  async getProductById(id: string, companyId?: string) {
    const product = await productRepository.findById(id, companyId);
    if (!product) return null;
    return toProduct(product);
  }

  async createProduct(companyId: string, data: CreateProductDto) {
    const product = await productRepository.create(companyId, data);
    return toProduct(product);
  }

  async updateProduct(data: UpdateProductDto) {
    if (data.status) {
      const existing = await productRepository.findById(data.id);
      if (existing) {
        const transition = validateProductStatusTransition(existing.status as any, data.status as any);
        if (!transition.valid) {
          throw new Error(transition.error);
        }
      }
    }

    const product = await productRepository.update(data);
    return toProduct(product);
  }

  async archiveProduct(id: string) {
    const existing = await productRepository.findById(id);
    if (existing) {
      const transition = validateProductStatusTransition(existing.status as any, "ARCHIVED" as any);
      if (!transition.valid) {
        throw new Error(transition.error);
      }
    }
    return productRepository.archive(id);
  }
}

export const productService = new ProductService();