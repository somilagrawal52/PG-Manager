import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import { PropertyModel } from "@/lib/mongodb/models";

export async function GET() {
  try {
    await connectToDatabase();
    const properties = await PropertyModel.find().lean();
    return NextResponse.json({ success: true, properties });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const newProperty = await PropertyModel.create({
      ...body,
      id: `prop-${Date.now()}`,
      organization_id: body.organization_id || "org-demo-001",
    });
    return NextResponse.json({ success: true, property: newProperty });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
