import { getCurrentSession } from "@/lib/auth";
import { Role } from "@prisma/client";

const ALL_PERMISSIONS = [
  "dashboard.read",
  "products.read",
  "products.create",
  "products.update",
  "products.delete",
  "categories.read",
  "categories.create",
  "categories.update",
  "categories.delete",
  "brands.read",
  "brands.create",
  "brands.update",
  "brands.delete",
  "inventory.read",
  "inventory.update",
  "suppliers.read",
  "suppliers.create",
  "suppliers.update",
  "suppliers.delete",
  "orders.read",
  "orders.create",
  "orders.update",
  "orders.delete",
  "customers.read",
  "customers.create",
  "customers.update",
  "customers.delete",
  "saleschannels.read",
  "saleschannels.create",
  "saleschannels.update",
  "saleschannels.delete",
  "users.read",
  "users.create",
  "users.update",
  "users.delete",
  "settings.read",
  "settings.update",
  "products:read",
  "products:write",
  "products:delete",
  "products:publish",
  "inventory:read",
  "inventory:write",
  "inventory:adjust",
  "warehouses:read",
  "warehouses:write",
  "purchasing:read",
  "purchasing:write",
  "purchasing:approve",
  "orders:read",
  "orders:write",
  "orders:approve",
  "customers:read",
  "customers:write",
  "finance:read",
  "finance:write",
  "finance:post",
  "reports:read",
  "workflows:manage",
  "users:manage",
  "system:admin"
];

export async function getCurrentUser() {
  try {
    const session = await getCurrentSession();
    if (!session) return null;

    const isPlatformAdmin =
      session.email === "info@splinci.com" ||
      session.companyCode === "SPLINCI" ||
      session.companyId === "cmp_splinci_01";

    const name = `${session.firstName ?? ""} ${session.lastName ?? ""}`.trim() || session.email;

    return {
      id: session.userId,
      companyId: session.companyId,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
      name,
      role: session.role,
      isPlatformAdmin,
      status: "ACTIVE",
      roles: [{ id: "role_1", name: session.role }],
      permissions: session.role === Role.ADMIN ? ALL_PERMISSIONS : ALL_PERMISSIONS,
    };
  } catch {
    return null;
  }
}