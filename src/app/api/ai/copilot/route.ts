import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ success: false, message: "Prompt is required." }, { status: 400 });
    }

    // Fetch real-time system context for the AI
    const [productsCount, lowStockItems, ordersCount, revenueAggregate, customersCount] = await Promise.all([
      prisma.product.count(),
      prisma.inventoryItem.findMany({
        where: { availableQty: { lte: 10 } },
        include: { product: true },
        take: 5,
      }),
      prisma.salesOrder.count(),
      prisma.salesOrder.aggregate({ _sum: { totalAmount: true } }),
      prisma.customer.count(),
    ]);

    const totalRevenue = Number(revenueAggregate._sum.totalAmount ?? 0);
    const lowStockCount = lowStockItems.length;

    const systemContext = `
System Context for Atlas ERP:
- Total Products: ${productsCount}
- Low Stock Items: ${lowStockCount} (${lowStockItems.map(i => `${i.product.title} [Available: ${i.availableQty}]`).join(", ") || "None"})
- Total Orders: ${ordersCount}
- Total Revenue: $${totalRevenue.toLocaleString()}
- Active Customers: ${customersCount}
`;

    // Initialize Gemini AI if API key is present, or fallback to intelligent rule engine
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    let reply = "";

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `You are Splinci AI, an intelligent executive operational assistant inside Splinci Commerce OS software. Answer the user's business question concisely using the provided real-time ERP system context. Format your response in clean markdown bullets with actionable advice.\n\n${systemContext}\n\nUser Question: ${prompt}`,
        });
        reply = response.text ?? "";
      } catch {
        // Fallback to contextual response engine
      }
    }

    if (!reply) {
      // Intelligent Contextual Fallback Engine
      const lower = prompt.toLowerCase();
      if (lower.includes("low") || lower.includes("stock") || lower.includes("reorder")) {
        if (lowStockCount > 0) {
          reply = `⚠️ **Low Stock Alert**: You currently have **${lowStockCount} items** below safety threshold:\n` +
            lowStockItems.map(i => `• **${i.product.title}** (${i.product.sku}): ${i.availableQty} units available`).join("\n") +
            `\n\n👉 **Recommended Action**: Go to [Purchase Orders](/purchasing) to issue restock POs to your suppliers.`;
        } else {
          reply = `✅ **Inventory Optimal**: All items are currently above minimum safety stock thresholds across active sales channels!`;
        }
      } else if (lower.includes("sales") || lower.includes("revenue") || lower.includes("order")) {
        reply = `📊 **Sales & Revenue Summary**:\n• Total Orders Processed: **${ordersCount}**\n• Gross Revenue: **$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}**\n• Active Customers: **${customersCount}**`;
      } else {
        reply = `💡 **Splinci Operational Intelligence**:\n` +
          `• **Catalog Status**: ${productsCount} total products registered.\n` +
          `• **Supply Chain**: ${lowStockCount} items require reordering.\n` +
          `• **Revenue**: $${totalRevenue.toLocaleString()} across ${ordersCount} orders.`;
      }
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI Copilot error.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
