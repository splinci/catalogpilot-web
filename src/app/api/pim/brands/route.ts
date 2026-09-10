import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { brandRepository } from "@/repositories/brand.repository";
import { CreateBrandSchema } from "@/types/pim.dto";
import { authorizationService } from "@/services/authorization.service";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "products:read")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const brands = await brandRepository.findMany(session.companyId);
    return NextResponse.json({ success: true, data: brands });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!authorizationService.hasPermission(session.role, "products:write")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = CreateBrandSchema.parse(body);

    const existingName = await brandRepository.findByName(session.companyId, data.name);
    if (existingName) {
      return NextResponse.json({ success: false, error: `Brand '${data.name}' already exists` }, { status: 400 });
    }

    const brand = await brandRepository.create(session.companyId, data, session.userId);
    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
