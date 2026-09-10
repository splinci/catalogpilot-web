import { supplierRepository } from "../repository/supplier.repository";

import {
  createSupplierSchema,
  updateSupplierSchema,
} from "../validators/supplier.validator";

import type { CreateSupplierDto } from "../dto/create-supplier.dto";
import type { UpdateSupplierDto } from "../dto/update-supplier.dto";

export class SupplierService {
  async findAll() {
    return supplierRepository.findAll();
  }

  async findById(id: string) {
    const supplier =
      await supplierRepository.findById(id);

    if (!supplier) {
      throw new Error("Supplier not found.");
    }

    return supplier;
  }

  async getStatistics() {
    return supplierRepository.getStatistics();
  }

  async create(data: CreateSupplierDto) {
    const validated =
      createSupplierSchema.parse(data);

    const existing =
      await supplierRepository.findByCode(
        validated.code
      );

    if (existing) {
      throw new Error(
        "Supplier code already exists."
      );
    }

    return supplierRepository.create(validated);
  }

  async update(data: UpdateSupplierDto) {
    const validated =
      updateSupplierSchema.parse(data);

    await this.findById(validated.id);

    const existing =
      await supplierRepository.findByCode(
        validated.code
      );

    if (
      existing &&
      existing.id !== validated.id
    ) {
      throw new Error(
        "Supplier code already exists."
      );
    }

    return supplierRepository.update(validated);
  }

  async archive(id: string) {
    await this.findById(id);

    return supplierRepository.archive(id);
  }
}

export const supplierService =
  new SupplierService();