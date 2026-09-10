import * as XLSX from "xlsx";
import { BulkProduct } from "@/types/bulk";

export function parseExcel(file: File): Promise<BulkProduct[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;

        const workbook = XLSX.read(data, {
          type: "array",
        });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        const products: BulkProduct[] = rows.map((row) => ({
          sku: String(row["SKU"] ?? "").trim(),
          brand: String(row["Brand"] ?? "").trim(),
          name: String(row["Product Name"] ?? "").trim(),
          category: String(row["Category"] ?? "").trim(),
          marketplace: String(row["Marketplace"] ?? "").trim(),
          description: String(row["Description"] ?? "").trim(),
          price: Number(row["Price"] ?? 0),
          imageName: String(row["Image Name"] ?? "").trim(),
        }));

        resolve(products);
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsArrayBuffer(file);
  });
}