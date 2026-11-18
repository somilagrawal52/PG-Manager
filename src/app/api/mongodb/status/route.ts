import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import {
  OrgModel,
  PropertyModel,
  RoomModel,
  BedModel,
  ResidentModel,
  RentChargeModel,
  PaymentModel,
  DepositTransactionModel,
  MaintenanceTicketModel,
} from "@/lib/mongodb/models";

export async function GET() {
  try {
    await connectToDatabase();

    const [
      propertiesCount,
      roomsCount,
      bedsCount,
      residentsCount,
      chargesCount,
      paymentsCount,
      depositsCount,
      ticketsCount,
    ] = await Promise.all([
      PropertyModel.countDocuments(),
      RoomModel.countDocuments(),
      BedModel.countDocuments(),
      ResidentModel.countDocuments(),
      RentChargeModel.countDocuments(),
      PaymentModel.countDocuments(),
      DepositTransactionModel.countDocuments(),
      MaintenanceTicketModel.countDocuments(),
    ]);

    return NextResponse.json({
      connected: true,
      database: "staymanage",
      uri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/staymanage",
      counts: {
        properties: propertiesCount,
        rooms: roomsCount,
        beds: bedsCount,
        residents: residentsCount,
        rent_charges: chargesCount,
        payments: paymentsCount,
        deposits: depositsCount,
        maintenance_tickets: ticketsCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        connected: false,
        error: error.message || "Failed to connect to local MongoDB.",
      },
      { status: 500 }
    );
  }
}
