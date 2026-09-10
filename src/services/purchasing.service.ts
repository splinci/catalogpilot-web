/**
 * Re-export facade for Purchasing Domain Services & Policies
 */
export { SupplierService, supplierService } from "./purchasing/supplier.service";
export { PurchaseOrderService, purchaseOrderService, purchaseOrderService as purchasingService } from "./purchasing/purchase-order.service";
export { GoodsReceiptService, goodsReceiptService } from "./purchasing/goods-receipt.service";
export { ProcurementAnalyticsService, procurementAnalyticsService } from "./purchasing/procurement-analytics.service";
export { ApprovalWorkflowService, approvalWorkflowService } from "./purchasing/approval-workflow.service";
export { ProcurementPolicy, procurementPolicy } from "./purchasing/procurement.policy";
export { InventoryIntegrationPolicy, inventoryIntegrationPolicy } from "./purchasing/inventory-integration.policy";
export { ApprovalWorkflowPolicy, approvalWorkflowPolicy } from "./purchasing/approval-workflow.policy";
