import "dotenv/config";
import { PrismaClient, Role, ProductStatus } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as argon2 from "argon2";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaNeon({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting Atlas Enterprise Database Seed (DBA-003)...");

  // 1. Seed Enterprise Company
  const company = await prisma.company.upsert({
    where: { code: "ATLAS" },
    update: {},
    create: {
      id: "cmp_atlas_01",
      code: "ATLAS",
      legalName: "Atlas Commerce OS Inc.",
      displayName: "Atlas Enterprise",
      taxId: "US99-8877665",
      isActive: true,
    },
  });

  console.log(`✅ Enterprise Company: ${company.displayName} (${company.code})`);

  // 2. Seed Admin Password with Argon2id (Environment Only - Fail Closed)
  const rawAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!rawAdminPassword) {
    throw new Error(
      "INITIAL_ADMIN_PASSWORD environment variable must be configured before running database seed."
    );
  }

  const adminPasswordHash = await argon2.hash(rawAdminPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  // 3. Seed Enterprise Users across Roles
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@atlas.com" },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      id: "usr_admin_01",
      companyId: company.id,
      email: "admin@atlas.com",
      passwordHash: adminPasswordHash,
      firstName: "Atlas",
      lastName: "Administrator",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Admin User Seeded: ${adminUser.email} (Role: ${adminUser.role})`);

  // 3b. Seed Splinci Platform Operator Company & info@splinci.com Administrator
  const splinciCompany = await prisma.company.upsert({
    where: { code: "SPLINCI" },
    update: {},
    create: {
      id: "cmp_splinci_01",
      code: "SPLINCI",
      legalName: "Splinci Commerce OS Inc.",
      displayName: "Splinci Platform Operations",
      taxId: "US99-0011223",
      isActive: true,
    },
  });

  const platformAdmin = await prisma.user.upsert({
    where: { email: "info@splinci.com" },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      id: "usr_splinci_admin_01",
      companyId: splinciCompany.id,
      email: "info@splinci.com",
      passwordHash: adminPasswordHash,
      firstName: "Splinci",
      lastName: "Platform Operator",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Platform Admin Seeded: ${platformAdmin.email} (Role: ${platformAdmin.role}, Company: ${splinciCompany.code})`);

  // 4. Seed Categories
  const category = await prisma.category.upsert({
    where: { companyId_slug: { companyId: company.id, slug: "electronics" } },
    update: {},
    create: {
      companyId: company.id,
      name: "Electronics & Hardware",
      slug: "electronics",
    },
  });

  // 5. Seed Brand
  const brand = await prisma.brand.upsert({
    where: { companyId_name: { companyId: company.id, name: "Atlas Hardware" } },
    update: {},
    create: {
      companyId: company.id,
      name: "Atlas Hardware",
    },
  });

  // 6. Seed Supplier
  const supplier = await prisma.supplier.upsert({
    where: { companyId_code: { companyId: company.id, code: "SUP-001" } },
    update: {},
    create: {
      companyId: company.id,
      code: "SUP-001",
      name: "Global Microtech Components",
      email: "orders@microtech.com",
    },
  });

  // 7. Seed Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { companyId_code: { companyId: company.id, code: "WH-MAIN" } },
    update: {},
    create: {
      companyId: company.id,
      code: "WH-MAIN",
      name: "Main Distribution Center",
      address: "100 Enterprise Way, Silicon Valley, CA",
    },
  });

  // 8. Seed Products
  const product = await prisma.product.upsert({
    where: { companyId_sku: { companyId: company.id, sku: "SKU-ATL-001" } },
    update: {},
    create: {
      companyId: company.id,
      sku: "SKU-ATL-001",
      title: "Atlas Enterprise Workstation Laptop Hub",
      description: "High-performance Thunderbolt 4 Quad-Display Docking Workstation",
      categoryId: category.id,
      brandId: brand.id,
      supplierId: supplier.id,
      price: 249.99,
      costPrice: 110.00,
      status: ProductStatus.PUBLISHED,
      qualityScore: 98,
    },
  });

  // 9. Seed Inventory Item
  await prisma.inventoryItem.upsert({
    where: {
      companyId_productId_warehouseId: {
        companyId: company.id,
        productId: product.id,
        warehouseId: warehouse.id,
      },
    },
    update: {},
    create: {
      companyId: company.id,
      productId: product.id,
      warehouseId: warehouse.id,
      onHandQty: 150,
      availableQty: 140,
      reservedQty: 10,
      reorderLevel: 25,
    },
  });

  console.log("🎉 Atlas Enterprise Database seeded successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seed Error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });