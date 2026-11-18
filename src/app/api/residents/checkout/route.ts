import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import { StayModel, ResidentModel, BedModel, DepositTransactionModel } from "@/lib/mongodb/models";
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

    // 1. Update in memory store
    appStore.checkoutResident({
      residentId: resident_id,
      checkOutDate: check_out_date,
      deductionPaise: Number(deduction_paise || 0),
      deductionReason: deduction_reason,
      refundPaise: Number(refund_paise || 0),
      refundMethod: refund_method || "upi",
    });

    // 2. Persist in MongoDB if available
    try {
      await connectToDatabase();
      const currentStay = await StayModel.findOne({ resident_id, status: "active" });
      if (currentStay) {
        currentStay.status = "completed";
        currentStay.actual_check_out_date = check_out_date;
        await currentStay.save();

        await BedModel.updateOne({ id: currentStay.bed_id }, { status: "available" });
        await ResidentModel.updateOne({ id: resident_id }, { status: "checked_out" });

        if (deduction_paise > 0) {
          await DepositTransactionModel.create({
            id: `dep-deduct-${Date.now()}`,
            resident_id,
            stay_id: currentStay.id,
            property_id: currentStay.property_id,
            transaction_type: "deduction",
            amount_paise: deduction_paise,
            reason: deduction_reason || "Move-out inspection deduction",
            payment_method: "other",
            transaction_date: check_out_date,
          });
        }

        if (refund_paise > 0) {
          await DepositTransactionModel.create({
            id: `dep-refund-${Date.now()}`,
            resident_id,
            stay_id: currentStay.id,
            property_id: currentStay.property_id,
            transaction_type: "refund",
            amount_paise: refund_paise,
            reason: "Security deposit settlement refund",
            payment_method: refund_method || "upi",
            transaction_date: check_out_date,
          });
        }
      }
    } catch {
      // In-store update succeeded
    }

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
