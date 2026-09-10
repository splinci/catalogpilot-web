import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";
import { warehouseRepository } from "@/repositories/warehouse.repository";
import { CreateWarehouseSchema } from "@/types/inventory.dto";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const auth = requirePermission(session, PERMISSIONS.WAREHOUSE_READ);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    const warehouses = await warehouseRepository.findMany(session!.companyId);
    return NextResponse.json({ success: true, data: warehouses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    const auth = requirePermission(session, PERMISSIONS.WAREHOUSE_MANAGE);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    const body = await request.json();
    const data = CreateWarehouseSchema.parse(body);

    const existingCode = await warehouseRepository.findByCode(session!.companyId, data.code);
    if (existingCode) {
      return NextResponse.json({ success: false, error: `Warehouse code '${data.code}' already exists` }, { status: 400 });
    }

    const warehouse = await warehouseRepository.create(session!.companyId, data, session!.userId);
    return NextResponse.json({ success: true, data: warehouse }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
