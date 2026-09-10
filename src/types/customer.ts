export enum CustomerStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Customer {
  id: string;

  customerCode: string;

  name: string;

  email: string | null;

  phone: string | null;

  company: string | null;

  taxNumber: string | null;

  status: CustomerStatus;

  createdAt: Date;

  updatedAt: Date;
}

export interface CustomerFilters {
  search?: string;

  status?: CustomerStatus;

  page?: number;

  limit?: number;
}

export interface CustomerPagination {
  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

export interface CustomerListResponse {
  data: Customer[];

  pagination: CustomerPagination;
}