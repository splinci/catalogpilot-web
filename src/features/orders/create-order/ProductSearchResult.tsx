import type { Product } from "@/domains/product/types/product";

interface ProductSearchResultProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductSearchResult({
  product,
  onSelect,
}: ProductSearchResultProps) {
  const inStock = product.currentStock > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      disabled={!inStock}
      className="block w-full border-b p-4 text-left transition-colors last:border-b-0 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">
            {product.name}
          </h4>

          <p className="text-sm text-muted-foreground">
            SKU: {product.sku}
          </p>
        </div>

        <div className="text-right">
          <div className="font-semibold">
            ₹{Number(product.sellingPrice).toFixed(2)}
          </div>

          <div
            className={`text-xs ${
              inStock
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {inStock
              ? `Stock: ${product.currentStock}`
              : "Out of Stock"}
          </div>
        </div>
      </div>
    </button>
  );
}