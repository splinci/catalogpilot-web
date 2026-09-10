export interface Supplier {
    id: string;
  
    code: string;
    name: string;
  
    contactPerson?: string | null;
  
    email?: string | null;
    phone?: string | null;
  
    address?: string | null;
  
    status: "ACTIVE" | "INACTIVE";
  
    createdAt: Date;
    updatedAt: Date;
  }