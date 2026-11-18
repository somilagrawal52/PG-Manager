import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import { ResidentModel, StayModel, BedModel, DepositTransactionModel } from "@/lib/mongodb/models";

export async function GET() {
  try {
    await connectToDatabase();
    const [residents, stays, beds] = await Promise.all([
      ResidentModel.find().lean(),
      StayModel.find({ status: "active" }).lean(),
      BedModel.find().lean(),
    ]);

    const enriched = residents.map((res: any) => {
      const stay = stays.find((s: any) => s.resident_id === res.id);
      let stayWithBed = stay;
      if (stay) {
        const bed = beds.find((b: any) => b.id === stay.bed_id);
        stayWithBed = { ...stay, bed };
      }
      return { ...res, current_stay: stayWithBed };
    });

    return NextResponse.json({ success: true, residents: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { resident, allocation } = body;

    const resId = `res-${Date.now()}`;
    const newResident = await ResidentModel.create({
      ...resident,
      id: resId,
      organization_id: resident.organization_id || "org-demo-001",
      status: "active",
    });

    if (allocation) {
      // Check bed occupancy invariant in MongoDB
      const activeStay = await StayModel.findOne({ bed_id: allocation.bed_id, status: "active" });
      if (activeStay) {
        return NextResponse.json(
          { success: false, error: "Bed is already occupied by an active resident." },
          { status: 400 }
        );
      }

      const stayId = `stay-${Date.now()}`;
      await StayModel.create({
        id: stayId,
        resident_id: resId,
        bed_id: allocation.bed_id,
        property_id: allocation.property_id,
        check_in_date: allocation.check_in_date,
        monthly_rent_paise: allocation.monthly_rent_paise,
        security_deposit_paise: allocation.security_deposit_paise || 0,
        status: "active",
      });

      // Mark bed as occupied
      await BedModel.updateOne({ id: allocation.bed_id }, { status: "occupied" });

      // Record deposit collection if applicable
      if (allocation.security_deposit_paise > 0) {
        await DepositTransactionModel.create({
          id: `dep-${Date.now()}`,
          resident_id: resId,
          stay_id: stayId,
          property_id: allocation.property_id,
          transaction_type: "collected",
          amount_paise: allocation.security_deposit_paise,
          reason: "Security deposit collected during onboarding",
          payment_method: allocation.deposit_payment_method || "upi",
          transaction_date: allocation.check_in_date,
        });
      }
    }

    return NextResponse.json({ success: true, resident: newResident });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
