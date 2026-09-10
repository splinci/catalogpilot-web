import { NextResponse } from "next/server";
import { customerService } from "@/domains/customer/services/customer.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") ?? undefined;
    const statusParam = searchParams.get("status");

    const customers = await customerService.exportCustomers({
      search,
      status: statusParam as any,
    });

    const rows = [
      [
        "Customer Code",
        "Name",
        "Company",
        "Email",
        "Phone",
        "Status",
        "Tax Number",
        "Created At",
      ],
      ...customers.map((customer: any) => [
        customer.customerCode || "",
        customer.legalName || customer.name || "",
        customer.company || "",
        customer.email || "",
        customer.phone || "",
        customer.status || "ACTIVE",
        customer.taxNumber || "",
        customer.createdAt ? new Date(customer.createdAt).toISOString() : "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="customers.csv"',
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to export customers.",
      },
      {
        status: 500,
      }
    );
  }
}