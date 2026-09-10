export interface CreateCustomerDto {
  
  name: string;

  email: string;

  phone?: string;

  company?: string;

  taxNumber?: string;
}