import {
  BulkProduct,
  ValidationResult,
  ProductValidation,
} from "@/types/bulk";

function normalizeFileName(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .trim()
    .toLowerCase();
}

export function validateMatches(
  products: BulkProduct[],
  images: File[]
): ValidationResult {
  const imageNames = images.map((image) =>
    normalizeFileName(image.name)
  );

  const duplicateImages = imageNames.filter(
    (name, index) => imageNames.indexOf(name) !== index
  );

  const items: ProductValidation[] = [];

  let matched = 0;
  let missing = 0;

  for (const product of products) {
    const expectedImage = normalizeFileName(product.imageName);

    const index = imageNames.indexOf(expectedImage);

    if (index !== -1) {
      matched++;

      items.push({
        sku: product.sku,

        productName: product.name,

        brand: product.brand,
        category: product.category,
        marketplace: product.marketplace,
        description: product.description,
        price: product.price,

        expectedImage: product.imageName,

        uploadedImage: images[index].name,
        uploadedFile: images[index],

        status: "matched",

        message: "Image matched successfully.",
      });
    } else {
      missing++;

      items.push({
        sku: product.sku,

        productName: product.name,

        brand: product.brand,
        category: product.category,
        marketplace: product.marketplace,
        description: product.description,
        price: product.price,

        expectedImage: product.imageName,

        uploadedImage: undefined,
        uploadedFile: undefined,

        status: "missing",

        message: "Image not found.",
      });
    }
  }

  return {
    totalProducts: products.length,
    totalImages: images.length,

    matched,
    missing,
    duplicate: duplicateImages.length,

    items,

    isValid: missing === 0 && duplicateImages.length === 0,
  };
}