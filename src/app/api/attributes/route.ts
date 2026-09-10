import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { requirePermission, PERMISSIONS } from "@/lib/auth/permissions";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const auth = requirePermission(session, PERMISSIONS.CATALOG_READ);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load attributes." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const auth = requirePermission(session, PERMISSIONS.ATTRIBUTES_MANAGE);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: session ? 403 : 401 });
    }

    const body = await req.json();
    const { name, code, description, values } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Attribute name is required" },
        { status: 400 }
      );
    }

    const valueItems = Array.isArray(values) ? values : [];
    const newAttr = {
      id: `attr_${Date.now()}`,
      companyId: session!.companyId,
      name,
      code: code || `ATTR_${name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`,
      description: description || null,
      values: valueItems.map((val: string, idx: number) => ({ id: `val_${Date.now()}_${idx}`, value: val })),
    };

    return NextResponse.json({ success: true, data: newAttr }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create attribute" },
      { status: 500 }
    );
  }
}
