export interface RecentProduct {
    id: string;
    sku: string;
    name: string;
    imageUrl?: string | null;
    brand: string | null;
    currentStock: number;
    minimumStock: number;
    status: string;
    createdAt: Date;
  }
  
  export interface InventoryOverview {
    inStock: number;
    lowStock: number;
    outOfStock: number;
  }
  
  export interface LowStockProduct {
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    minimumStock: number;
  }
  
  export interface CategoryDistribution {
    category: string;
    products: number;
  }
  
  export interface AIRecommendation {
    title: string;
    message: string;
    actionLabel?: string;
    actionHref?: string;
    severity: "warning" | "info" | "success";
  }

  export interface DashboardSummary {
    totalProducts: number;
    publishedProducts: number;
    inventoryItems: number;
    brands: number;
    categories: number;
    suppliers: number;
    lowStock: number;
    totalOrders: number;
    totalRevenue: number;
    activeCustomers: number;
    pendingPOs: number;
    receivedPOs: number;
    shipmentsSent: number;
    warehousesCount: number;
    aiQueuedTasks: number;

    inventoryOverview: InventoryOverview;
    lowStockProducts: LowStockProduct[];
    categoryDistribution: CategoryDistribution[];
    recentProducts: RecentProduct[];
    aiRecommendation?: AIRecommendation;
  }