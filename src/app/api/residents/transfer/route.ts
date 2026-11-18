import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import { StayModel, BedModel } from "@/lib/mongodb/models";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { resident_id, new_bed_id } = body;

    const currentStay = await StayModel.findOne({ resident_id, status: "active" });
    if (!currentStay) {
      return NextResponse.json({ success: false, error: "Active stay not found" }, { status: 404 });
    }

    const targetBed = await BedModel.findOne({ id: new_bed_id });
    if (!targetBed) {
      return NextResponse.json({ success: false, error: "Target bed not found" }, { status: 404 });
    }
    if (targetBed.status !== "available") {
      return NextResponse.json({ success: false, error: "Target bed is not available" }, { status: 400 });
    }

    // Release old bed
    await BedModel.updateOne({ id: currentStay.bed_id }, { status: "available" });

    // Occupy new bed
    await BedModel.updateOne({ id: new_bed_id }, { status: "occupied" });

    // Update stay
    currentStay.bed_id = new_bed_id;
    currentStay.property_id = targetBed.property_id;
    await currentStay.save();

    return NextResponse.json({ success: true, message: "Bed transfer successful" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
