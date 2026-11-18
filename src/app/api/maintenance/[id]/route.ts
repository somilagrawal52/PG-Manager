import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import { MaintenanceTicketModel } from "@/lib/mongodb/models";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();
    const { status, comment, author_name } = body;

    const ticket = await MaintenanceTicketModel.findOne({ id });
    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    if (status) {
      ticket.status = status;
      if (status === "resolved" || status === "closed") {
        ticket.resolved_at = new Date().toISOString();
      }
    }

    if (comment) {
      ticket.comments.push({
        id: `comm-${Date.now()}`,
        ticket_id: id,
        author_name: author_name || "Staff",
        comment,
        is_internal: false,
        created_at: new Date().toISOString(),
      });
    }

    await ticket.save();
    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
