import * as XLSX from "xlsx";

type GeneratedCatalog = {
  product: {
    sku: string;
    name: string;
    brand: string;
    category?: string;
    marketplace?: string;
    price?: number;
  };
  catalog: {
    title: string;
    description: string;
    features: string[];
    seoKeywords: string[];
  };
};

export function exportCatalogExcel(
  catalogs: GeneratedCatalog[]
) {
  const rows = catalogs.map((item) => {
    const row: Record<string, string | number> = {
      SKU: item.product.sku,
      Brand: item.product.brand,
      "Product Name": item.product.name,
      Category: item.product.category ?? "",
      Marketplace: item.product.marketplace ?? "",
      Price: item.product.price ?? "",

      "AI Title": item.catalog.title,

      "AI Description": item.catalog.description,
    };

    // Features

    for (let i = 0; i < 10; i++) {
      row[`Feature ${i + 1}`] =
        item.catalog.features[i] ?? "";
    }

    // SEO Keywords

    for (let i = 0; i < 20; i++) {
      row[`SEO Keyword ${i + 1}`] =
        item.catalog.seoKeywords[i] ?? "";
    }

    return row;
  });

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "AI Catalog"
  );

  XLSX.writeFile(
    workbook,
    "atlas-ai-catalog.xlsx"
  );
}