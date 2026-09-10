import { NextResponse } from "next/server";
import ai from "@/services/ai/geminiService";

export async function POST(request: Request) {
  try {
    const { product } = await request.json();

    const prompt = `
You are a senior Amazon and Flipkart e-commerce copywriter.

Generate a professional, SEO-optimized product catalog.

Requirements:

1. Create a compelling product title.
2. The title should be 80-150 characters.
3. Include:
   - Brand
   - Product Name
   - Model or Storage (if available)
   - Color (if available)
   - Important product features
4. Do NOT start the title with words like "New", "Latest", "Best", or "Premium".
5. Do NOT repeat words.
6. Write the title exactly like a real Amazon or Flipkart listing.

Example title:

Apple iPhone 15 (128GB) Black | A16 Bionic Chip | Dynamic Island | 48MP Camera | Super Retina XDR Display

Do NOT copy the example.
Create a unique title based on the product below.

Product Name: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Marketplace: ${product.marketplace}
SKU: ${product.sku}
Price: ₹${product.price}
Description: ${product.description}

Return ONLY valid JSON.

Do not include markdown.
Do not use \`\`\`json.
Do not add explanations.

Generate:
- One SEO-optimized title
- One detailed marketing description
- 8-10 product features
- 15-20 SEO keywords

Return JSON in this format:

{
  "title": "",
  "description": "",
  "features": [],
  "seoKeywords": []
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    if (!text?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini returned an empty response.",
        },
        {
          status: 500,
        }
      );
    }

    let catalog;

    try {
      catalog = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini returned invalid JSON.",
          rawResponse: text,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      catalog,
    });
  } catch (error) {
    console.error("AI Catalog Generation Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI catalog.",
      },
      {
        status: 500,
      }
    );
  }
}