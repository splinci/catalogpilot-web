export interface UpdateSupplierDto {
    id: string;
    code: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
  }