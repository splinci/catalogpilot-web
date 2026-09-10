export interface ProductMapperInput {
  costPrice?: unknown;
  sellingPrice?: unknown;
  price?: unknown;
  currentStock?: unknown;
  minimumStock?: unknown;
  title?: unknown;
  name?: unknown;
  [key: string]: unknown;
}

export function toProduct<T extends Record<string, any>>(product: T) {
  return {
    ...product,
    name: product.title || product.name || "",
    costPrice: Number(product.costPrice ?? 0),
    sellingPrice: Number(product.sellingPrice ?? product.price ?? 0),
    currentStock: Number(product.currentStock ?? 100),
    minimumStock: Number(product.minimumStock ?? 10),
  };
}

export function toProducts<T extends Record<string, any>>(products: T[]) {
  return products.map(toProduct);
}