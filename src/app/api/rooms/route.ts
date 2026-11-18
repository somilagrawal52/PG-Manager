import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb/client";
import { RoomModel, BedModel } from "@/lib/mongodb/models";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("property_id");

    const query = propertyId ? { property_id: propertyId } : {};
    const [rooms, beds] = await Promise.all([
      RoomModel.find(query).lean(),
      BedModel.find(propertyId ? { property_id: propertyId } : {}).lean(),
    ]);

    const roomsWithBeds = rooms.map((r: any) => ({
      ...r,
      beds: beds.filter((b: any) => b.room_id === r.id),
    }));

    return NextResponse.json({ success: true, rooms: roomsWithBeds, beds });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const roomId = `room-${Date.now()}`;
    const capacity = Number(body.capacity || 2);

    const room = await RoomModel.create({
      ...body,
      id: roomId,
    });

    const newBeds: any[] = [];
    const letters = ["A", "B", "C", "D", "E", "F"];
    for (let i = 0; i < capacity; i++) {
      const letter = letters[i] || `${i + 1}`;
      newBeds.push({
        id: `bed-${roomId}-${letter.toLowerCase()}`,
        room_id: roomId,
        property_id: body.property_id,
        bed_identifier: `${body.room_number}-${letter}`,
        status: "available",
      });
    }

    await BedModel.insertMany(newBeds);

    return NextResponse.json({ success: true, room: { ...room.toObject(), beds: newBeds } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
