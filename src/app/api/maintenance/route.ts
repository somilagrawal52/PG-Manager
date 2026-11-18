import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import { MaintenanceTicketModel } from "@/lib/mongodb/models";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const residentId = searchParams.get("resident_id");
    const propertyId = searchParams.get("property_id");

    const query: any = {};
    if (residentId) query.resident_id = residentId;
    if (propertyId) query.property_id = propertyId;

    const tickets = await MaintenanceTicketModel.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket = await MaintenanceTicketModel.create({
      ...body,
      id: `ticket-${Date.now()}`,
      ticket_number: ticketNumber,
      status: "open",
      comments: [],
    });

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
