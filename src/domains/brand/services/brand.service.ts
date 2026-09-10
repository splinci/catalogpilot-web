import { brandRepository } from "../repositories/brand.repository";

import type { CreateBrandDto } from "../dto/create-brand.dto";
import type { UpdateBrandDto } from "../dto/update-brand.dto";

export class BrandService {
  async getBrands(companyId: string) {
    return brandRepository.findAll(companyId);
  }

  async getBrandById(id: string, companyId?: string) {
    const brand = await brandRepository.findById(id, companyId);

    if (!brand) {
      throw new Error("Brand not found.");
    }

    return brand;
  }

  async createBrand(companyId: string, data: CreateBrandDto) {
    const existing = await brandRepository.findByCode(data.code, companyId);

    if (existing) {
      throw new Error("Brand code already exists.");
    }

    return brandRepository.create(companyId, data);
  }

  async updateBrand(id: string, data: UpdateBrandDto, companyId?: string) {
    await this.getBrandById(id, companyId);

    return brandRepository.update(id, data, companyId);
  }

  async deleteBrand(id: string, companyId?: string) {
    await this.getBrandById(id, companyId);

    return brandRepository.delete(id, companyId);
  }
}

export const brandService = new BrandService();