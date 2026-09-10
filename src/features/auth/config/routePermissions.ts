export const routePermissions: Record<string, string> = {
    "/": "dashboard.read",
  
    "/products": "products.read",
    "/categories": "categories.read",
    "/brands": "brands.read",
  
    "/inventory": "inventory.read",
    "/suppliers": "suppliers.read",
  
    "/orders": "orders.read",
    "/customers": "customers.read",
  
    "/administration/sales-channels": "saleschannels.read",
  
    "/users": "users.read",
  
    "/settings": "settings.read",

    "/admin/merchants/new": "system:admin",
  };