import { NextResponse } from "next/server";
import { appStore } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resident_id, check_out_date, deduction_paise, deduction_reason, refund_paise, refund_method } = body;

    if (!resident_id || !check_out_date) {
      return NextResponse.json(
        { success: false, error: "resident_id and check_out_date are required." },
        { status: 400 }
      );
    }

    appStore.checkoutResident({
      residentId: resident_id,
      checkOutDate: check_out_date,
      deductionPaise: Number(deduction_paise || 0),
      deductionReason: deduction_reason,
      refundPaise: Number(refund_paise || 0),
      refundMethod: refund_method || "upi",
    });

    return NextResponse.json({
      success: true,
      message: "Resident checkout and deposit settlement completed successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process checkout." },
      { status: 400 }
    );
  }
}
