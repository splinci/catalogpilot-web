import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator";

import { categoryRepository } from "../repositories/category.repository";

import type { CreateCategoryDto } from "../dto/create-category.dto";
import type { UpdateCategoryDto } from "../dto/update-category.dto";

export class CategoryService {
  async findAll(companyId: string) {
    return categoryRepository.findAll(companyId);
  }

  async findById(id: string, companyId?: string) {
    const category = await categoryRepository.findById(id, companyId);

    if (!category) {
      throw new Error("Category not found.");
    }

    return category;
  }

  async create(companyId: string, data: CreateCategoryDto) {
    const validated = createCategorySchema.parse(data);

    const existing = await categoryRepository.findByCode(validated.code, companyId);

    if (existing) {
      throw new Error("Category code already exists.");
    }

    return categoryRepository.create(companyId, validated);
  }

  async update(companyId: string, data: UpdateCategoryDto) {
    const validated = updateCategorySchema.parse(data);

    await this.findById(validated.id, companyId);

    const existing = await categoryRepository.findByCode(validated.code, companyId);

    if (existing && existing.id !== validated.id) {
      throw new Error("Category code already exists.");
    }

    return categoryRepository.update(validated.id, validated, companyId);
  }

  async archive(companyId: string, id: string) {
    await this.findById(id, companyId);

    return categoryRepository.archive(id, companyId);
  }
}

export const categoryService = new CategoryService();