export interface Customer {
    id: string;
  
    customerCode: string;
  
    name: string;
  
    email: string | null;
    phone: string | null;
  
    company: string | null;
  
    taxNumber: string | null;
  
    status: "ACTIVE" | "INACTIVE";
  
    createdAt: string;
    updatedAt: string;
  }