import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import { DepositTransactionModel } from "@/lib/mongodb/models";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const residentId = searchParams.get("resident_id");

    const query = residentId ? { resident_id: residentId } : {};
    const transactions = await DepositTransactionModel.find(query).sort({ transaction_date: -1 }).lean();
    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const newTx = await DepositTransactionModel.create({
      ...body,
      id: `dep-${Date.now()}`,
      transaction_date: body.transaction_date || new Date().toISOString().split("T")[0],
    });

    return NextResponse.json({ success: true, transaction: newTx });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
