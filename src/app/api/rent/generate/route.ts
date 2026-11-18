import { NextResponse } from "next/server";
import { appStore } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const billingMonth = body.billing_month || new Date().toISOString().slice(0, 7) + "-01";
    const dueDate = body.due_date || new Date().toISOString().slice(0, 7) + "-05";

    const result = appStore.generateMonthlyRentCharges(billingMonth, dueDate);

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
