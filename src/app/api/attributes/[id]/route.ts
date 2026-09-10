import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, values } = body;

    const valueItems = Array.isArray(values) ? values : [];
    const updated = {
      id,
      name: name || "Updated Attribute",
      description: description || null,
      values: valueItems.map((val: string, idx: number) => ({ id: `val_${Date.now()}_${idx}`, value: val })),
    };

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update attribute" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    return NextResponse.json({ success: true, message: "Attribute deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to delete attribute" },
      { status: 500 }
    );
  }
}
