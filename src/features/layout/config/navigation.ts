import {
  LayoutDashboard,
  Package,
  Tags,
  Shapes,
  Boxes,
  Truck,
  ShoppingCart,
  Users,
  Store,
  Settings,
  FileText,
} from "lucide-react";

import { NavigationSection } from "../types/navigation";

export const navigation: NavigationSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        permission: "dashboard.read",
      },
    ],
  },

  {
    title: "Catalog",
    items: [
      {
        title: "Products",
        href: "/products",
        icon: Package,
        permission: "products.read",
      },
      {
        title: "Categories",
        href: "/categories",
        icon: Tags,
        permission: "categories.read",
      },
      {
        title: "Brands",
        href: "/brands",
        icon: Shapes,
        permission: "brands.read",
      },
    ],
  },

  {
    title: "Inventory & Purchasing",
    items: [
      {
        title: "Inventory",
        href: "/inventory",
        icon: Boxes,
        permission: "inventory.read",
      },
      {
        title: "Purchase Orders",
        href: "/purchasing",
        icon: FileText,
        permission: "inventory.read",
      },
      {
        title: "Suppliers",
        href: "/suppliers",
        icon: Truck,
        permission: "suppliers.read",
      },
    ],
  },

  {
    title: "Sales",
    items: [
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
        permission: "orders.read",
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
        permission: "customers.read",
      },
      {
        title: "Sales Channels",
        href: "/administration/sales-channels",
        icon: Store,
        permission: "saleschannels.read",
      },
    ],
  },

  {
    title: "Administration",
    items: [
      {
        title: "Users",
        href: "/users",
        icon: Users,
        permission: "users.read",
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "settings.read",
      },
    ],
  },
];