import { prisma } from "@/lib/prisma";
import { DashboardSummary, AIRecommendation } from "@/types/dashboard";

export class DashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    const [
      totalProducts,
      publishedProducts,
      inventoryItemsCount,
      brands,
      categories,
      suppliers,
      recentProducts,
      categoryData,
      totalOrders,
      revenueAggregate,
      activeCustomers,
      lowStockCount,
      outOfStockCount,
      pendingPOs,
      receivedPOs,
      shipmentsSent,
      warehousesCount,
      aiQueuedTasks,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: "PUBLISHED" } }),
      prisma.inventoryItem.count(),
      prisma.brand.count(),
      prisma.category.count(),
      prisma.supplier.count(),
      prisma.product.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          brand: true,
        },
      }),
      prisma.category.findMany({
        select: {
          name: true,
          products: {
            select: {
              id: true,
            },
          },
        },
      }),
      prisma.salesOrder.count(),
      prisma.salesOrder.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.customer.count(),
      prisma.inventoryItem.count({ where: { onHandQty: { lte: 10 } } }),
      prisma.inventoryItem.count({ where: { onHandQty: 0 } }),
      prisma.purchaseOrder.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.purchaseOrder.count({ where: { status: "RECEIVED" } }),
      prisma.shipment.count(),
      prisma.warehouse.count(),
      prisma.aIJob.count({ where: { status: "INGESTED" } }),
    ]);

    const totalRevenue = Number(revenueAggregate._sum.totalAmount ?? 0);
    const lowStock = lowStockCount;
    const outOfStock = outOfStockCount;
    const inStock = Math.max(0, inventoryItemsCount - outOfStockCount);

    const categoryDistribution = categoryData.map((category) => ({
      category: category.name,
      products: category.products.length,
    }));

    const aiRecommendation: AIRecommendation = {
      title: "Operational Health Optimal",
      message: "All inventory levels are within target thresholds across active sales channels.",
      actionLabel: "View Catalog",
      actionHref: "/products",
      severity: "success",
    };

    return {
      totalProducts,
      publishedProducts,
      inventoryItems: inventoryItemsCount,
      brands,
      categories,
      suppliers,
      lowStock,
      totalOrders,
      totalRevenue,
      activeCustomers,
      pendingPOs,
      receivedPOs,
      shipmentsSent,
      warehousesCount,
      aiQueuedTasks,

      inventoryOverview: {
        inStock,
        lowStock,
        outOfStock,
      },

      lowStockProducts: [],

      categoryDistribution,

      recentProducts: recentProducts.map((product) => ({
        id: product.id,
        sku: product.sku,
        name: product.title,
        imageUrl: null,
        brand: product.brand?.name ?? null,
        currentStock: 100,
        minimumStock: 10,
        status: product.status as any,
        createdAt: product.createdAt,
      })),

      aiRecommendation,
    };
  }
}