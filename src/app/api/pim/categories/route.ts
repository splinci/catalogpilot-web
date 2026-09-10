import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { categoryRepository } from "@/repositories/category.repository";
import { CreateCategorySchema } from "@/types/pim.dto";
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

    const categories = await categoryRepository.findMany(session.companyId);
    return NextResponse.json({ success: true, data: categories });
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
    const data = CreateCategorySchema.parse(body);

    const existingSlug = await categoryRepository.findBySlug(session.companyId, data.slug);
    if (existingSlug) {
      return NextResponse.json({ success: false, error: `Category slug '${data.slug}' already exists` }, { status: 400 });
    }

    const category = await categoryRepository.create(session.companyId, data, session.userId);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
