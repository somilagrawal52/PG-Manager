import { NextResponse } from "next/server";
import { appStore } from "@/lib/store";

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

    const payment = appStore.recordPayment({
      resident_id,
      rent_charge_id,
      amount_paise: Number(amount_paise),
      payment_method: payment_method || "upi",
      payment_date: payment_date || new Date().toISOString().split("T")[0],
      reference_number,
      notes,
    });

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
