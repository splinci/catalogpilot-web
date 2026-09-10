import { CustomerStatus } from "@/generated/prisma/enums";

export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus;
}