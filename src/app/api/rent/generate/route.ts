import { NextResponse } from "next/server";
import { appStore } from "@/lib/store";
import { connectToDatabase } from "@/lib/mongodb/client";
import { StayModel, RentChargeModel } from "@/lib/mongodb/models";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const billingMonth = body.billing_month || new Date().toISOString().slice(0, 7) + "-01";
    const dueDate = body.due_date || new Date().toISOString().slice(0, 7) + "-05";

    // Store update
    const result = appStore.generateMonthlyRentCharges(billingMonth, dueDate);

    // MongoDB update if available
    try {
      await connectToDatabase();
      const activeStays = await StayModel.find({ status: "active" }).lean();
      for (const stay of activeStays as any[]) {
        // Idempotency check via findOneAndUpdate or insert
        const existing = await RentChargeModel.findOne({ stay_id: stay.id, billing_month: billingMonth });
        if (!existing) {
          await RentChargeModel.create({
            id: `charge-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            organization_id: stay.property_id || "org-demo-001",
            property_id: stay.property_id,
            resident_id: stay.resident_id,
            stay_id: stay.id,
            billing_month: billingMonth,
            due_date: dueDate,
            amount_paise: stay.monthly_rent_paise,
            late_fee_paise: 0,
            amount_paid_paise: 0,
            status: "unpaid",
            notes: `Monthly rent generated for ${billingMonth}`,
          });
        }
      }
    } catch {
      // In-store fallback
    }

    return NextResponse.json({
      success: true,
      message: `Rent generation complete for ${billingMonth}.`,
      generated_charges: result.generated,
      skipped_charges: result.skipped,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate rent charges." },
      { status: 500 }
    );
  }
}
