import { NextResponse } from "next/server";
import { appStore } from "@/lib/store";
import { connectToDatabase } from "@/lib/mongodb/client";
import { PaymentModel, RentChargeModel } from "@/lib/mongodb/models";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resident_id, rent_charge_id, amount_paise, payment_method, payment_date, reference_number, notes } = body;

    if (!resident_id || !amount_paise) {
      return NextResponse.json(
        { success: false, error: "resident_id and amount_paise are required." },
        { status: 400 }
      );
    }

    // Update in-store
    const payment = appStore.recordPayment({
      resident_id,
      rent_charge_id,
      amount_paise: Number(amount_paise),
      payment_method: payment_method || "upi",
      payment_date: payment_date || new Date().toISOString().split("T")[0],
      reference_number,
      notes,
    });

    // Sync in MongoDB
    try {
      await connectToDatabase();
      await PaymentModel.create({
        ...payment,
      });

      if (rent_charge_id) {
        const charge = await RentChargeModel.findOne({ id: rent_charge_id });
        if (charge) {
          charge.amount_paid_paise += Number(amount_paise);
          const totalDue = charge.amount_paise + charge.late_fee_paise;
          if (charge.amount_paid_paise >= totalDue) {
            charge.status = "paid";
          } else if (charge.amount_paid_paise > 0) {
            charge.status = "partially_paid";
          }
          await charge.save();
        }
      }
    } catch {
      // In-store fallback
    }

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record payment." },
      { status: 500 }
    );
  }
}
