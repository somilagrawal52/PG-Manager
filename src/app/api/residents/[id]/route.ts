import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import { ResidentModel, StayModel, BedModel, RentChargeModel, PaymentModel, DepositTransactionModel } from "@/lib/mongodb/models";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const resident = await ResidentModel.findOne({ id }).lean();
    if (!resident) {
      return NextResponse.json({ success: false, error: "Resident not found" }, { status: 404 });
    }

    const [stay, rentCharges, payments, depositTx] = await Promise.all([
      StayModel.findOne({ resident_id: id, status: "active" }).lean(),
      RentChargeModel.find({ resident_id: id }).sort({ billing_month: -1 }).lean(),
      PaymentModel.find({ resident_id: id }).sort({ payment_date: -1 }).lean(),
      DepositTransactionModel.find({ resident_id: id }).sort({ transaction_date: -1 }).lean(),
    ]);

    let stayWithBed: any = stay;
    if (stay) {
      const stayDoc = stay as any;
      const bed = await BedModel.findOne({ id: stayDoc.bed_id }).lean();
      stayWithBed = { ...stayDoc, bed };
    }

    return NextResponse.json({
      success: true,
      resident: {
        ...resident,
        current_stay: stayWithBed,
        rentCharges,
        payments,
        depositTx,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const updated = await ResidentModel.findOneAndUpdate({ id }, body, { new: true }).lean();
    return NextResponse.json({ success: true, resident: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
