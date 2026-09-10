import { salesChannelRepository } from "../repositories/sales-channel.repository";

import type { CreateSalesChannelDto } from "../dto/create-sales-channel.dto";
import type { UpdateSalesChannelDto } from "../dto/update-sales-channel.dto";

export const salesChannelService = {
  async getSalesChannels() {
    return salesChannelRepository.findAll();
  },

  async getSalesChannelById(id: string) {
    const channel =
      await salesChannelRepository.findById(id);

    if (!channel) {
      throw new Error("Sales channel not found.");
    }

    return channel;
  },

  async createSalesChannel(
    dto: CreateSalesChannelDto
  ) {
    const existing =
      await salesChannelRepository.findByCode(
        dto.code
      );

    if (existing) {
      throw new Error(
        "Sales channel code already exists."
      );
    }

    return salesChannelRepository.create(dto);
  },

  async updateSalesChannel(
    id: string,
    dto: UpdateSalesChannelDto
  ) {
    await this.getSalesChannelById(id);

    return salesChannelRepository.update(id, dto);
  },

  async deleteSalesChannel(id: string) {
    await this.getSalesChannelById(id);

    return salesChannelRepository.delete(id);
  },
};