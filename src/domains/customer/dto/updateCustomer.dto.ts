export interface UpdateCustomerDto {
  name?: string;

  email?: string;

  phone?: string;

  company?: string;

  taxNumber?: string;

  status?: "ACTIVE" | "INACTIVE";
}