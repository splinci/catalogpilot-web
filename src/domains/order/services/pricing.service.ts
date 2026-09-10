import type { CreateOrderDto } from "@/domains/order/dto/createOrder.dto";

type ValidatedProduct = {
  product: {
    sellingPrice: unknown;
  };
  item: {
    quantity: number;
  };
};

export const pricingService = {
  calculate(
    products: ValidatedProduct[],
    data: Pick<CreateOrderDto, "tax" | "discount" | "shipping">
  ) {
    const subtotal = products.reduce((sum, { product, item }) => {
      return (
        sum +
        Number(product.sellingPrice) * item.quantity
      );
    }, 0);

    const tax = data.tax ?? 0;
    const discount = data.discount ?? 0;
    const shipping = data.shipping ?? 0;

    const total =
      subtotal +
      tax +
      shipping -
      discount;

    return {
      subtotal,
      tax,
      discount,
      shipping,
      total,
    };
  },
};