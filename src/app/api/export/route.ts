import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

function getColumnLetter(column: number): string {
  let letter = "";

  while (column > 0) {
    const mod = (column - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    column = Math.floor((column - mod) / 26);
  }

  return letter;
}

export async function POST(request: Request) {
  try {
    const { product, catalog } = await request.json();

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "Project Atlas";
    workbook.company = "Project Atlas";
    workbook.subject = "AI Product Catalog";
    workbook.title = "Product Catalog";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Product Catalog");

    // -----------------------------
    // Create Columns
    // -----------------------------

    const columns = [
      { header: "SKU", key: "sku", width: 18 },
      { header: "Brand", key: "brand", width: 20 },
      { header: "Product Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 20 },
      { header: "Description", key: "description", width: 45 },
      { header: "Price", key: "price", width: 15 },
      { header: "Marketplace", key: "marketplace", width: 20 },
      { header: "AI Title", key: "title", width: 55 },
      { header: "AI Description", key: "aiDescription", width: 80 },
    ];

    // Dynamic Feature Columns
    catalog.features.forEach((_: string, index: number) => {
      columns.push({
        header: `Feature ${index + 1}`,
        key: `feature${index + 1}`,
        width: 35,
      });
    });

    // Dynamic SEO Columns
    catalog.seoKeywords.forEach((_: string, index: number) => {
      columns.push({
        header: `SEO Keyword ${index + 1}`,
        key: `seo${index + 1}`,
        width: 25,
      });
    });

    worksheet.columns = columns;

    // -----------------------------
    // Add Product Row
    // -----------------------------

    const row: Record<string, string | number> = {
      sku: product.sku,
      brand: product.brand,
      name: product.name,
      category: product.category,
      description: product.description,
      price: Number(product.price),
      marketplace: product.marketplace,
      title: catalog.title,
      aiDescription: catalog.description,
    };

    catalog.features.forEach((feature: string, index: number) => {
      row[`feature${index + 1}`] = feature;
    });

    catalog.seoKeywords.forEach((keyword: string, index: number) => {
      row[`seo${index + 1}`] = keyword;
    });

    worksheet.addRow(row);

    // -----------------------------
    // Header Styling
    // -----------------------------

    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "FFFFFF" },
        size: 11,
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1F4E78" },
      };

      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // -----------------------------
    // Style All Cells
    // -----------------------------

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "top",
          wrapText: true,
        };

        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // -----------------------------
    // Row Height
    // -----------------------------

    worksheet.getRow(2).height = 100;

    // -----------------------------
    // Price Formatting
    // -----------------------------

    const priceCell = worksheet.getCell("F2");

    priceCell.numFmt = '₹#,##0.00';

    priceCell.font = {
      bold: true,
      color: { argb: "008000" },
      size: 11,
    };

    // -----------------------------
    // Center Important Columns
    // -----------------------------

    ["A", "B", "D", "F", "G"].forEach((column) => {
      worksheet.getColumn(column).alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
    });

    // -----------------------------
    // Freeze Header
    // -----------------------------

    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // -----------------------------
    // Auto Filter
    // -----------------------------

    worksheet.autoFilter = {
      from: "A1",
      to: `${getColumnLetter(worksheet.columnCount)}1`,
    };

    // -----------------------------
    // Generate File
    // -----------------------------

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Catalog_${product.name}.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to export Excel.",
      },
      {
        status: 500,
      }
    );
  }
}