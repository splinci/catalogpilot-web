import { prisma } from "@/lib/prisma";

export const orderNumberService = {
  async generate(): Promise<string> {
    const lastOrder = await prisma.salesOrder.findFirst({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        orderNumber: true,
      },
    });

    if (!lastOrder) {
      return "ORD-000001";
    }

    const lastNumber = Number(
      lastOrder.orderNumber.replace("ORD-", "")
    );

    const nextNumber = isNaN(lastNumber) ? 1 : lastNumber + 1;

    return `ORD-${nextNumber.toString().padStart(6, "0")}`;
  },
};