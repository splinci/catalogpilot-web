import type { CreateSalesChannelDto } from "../dto/create-sales-channel.dto";
import type { UpdateSalesChannelDto } from "../dto/update-sales-channel.dto";

const MOCK_CHANNELS = [
  { id: "sc_1", name: "Shopify Storefront", code: "SHOPIFY_US", type: "ONLINE", country: "US", enabled: true },
  { id: "sc_2", name: "Amazon US Marketplace", code: "AMAZON_US", type: "MARKETPLACE", country: "US", enabled: true },
];

export const salesChannelRepository = {
  async findAll() {
    return MOCK_CHANNELS;
  },

  async findById(id: string) {
    return MOCK_CHANNELS.find((c) => c.id === id) || null;
  },

  async findByCode(code: string) {
    return MOCK_CHANNELS.find((c) => c.code === code) || null;
  },

  async create(dto: CreateSalesChannelDto) {
    return {
      id: `sc_${Date.now()}`,
      name: dto.name,
      code: dto.code,
      type: dto.type,
      country: dto.country || "US",
      description: dto.description || null,
      logoUrl: dto.logoUrl || null,
      websiteUrl: dto.websiteUrl || null,
      enabled: dto.enabled ?? true,
    };
  },

  async update(id: string, dto: UpdateSalesChannelDto) {
    return {
      id,
      name: dto.name || "Updated Channel",
      code: dto.code || "CHANNEL",
      type: dto.type || "ONLINE",
      country: dto.country || "US",
      description: dto.description || null,
      logoUrl: dto.logoUrl || null,
      websiteUrl: dto.websiteUrl || null,
      enabled: dto.enabled ?? true,
    };
  },

  async delete(id: string) {
    return { id, success: true };
  },
};