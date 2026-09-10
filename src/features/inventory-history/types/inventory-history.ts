export interface InventoryHistoryItem {
    id: string;
  
    type: string;
  
    quantity: number;
  
    beforeStock: number;
  
    afterStock: number;
  
    reference: string | null;
  
    remarks: string | null;
  
    createdAt: string;
  
    product: {
      id: string;
      sku: string;
      name: string;
    };
  }