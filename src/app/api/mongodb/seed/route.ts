import { NextResponse } from "next/server";
import { seedMongoDatabase } from "../../../../../scripts/seed-mongo";

export async function POST() {
  try {
    await seedMongoDatabase();
    return NextResponse.json({
      success: true,
      message: "MongoDB database re-seeded successfully with rich Indian PG dataset.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to seed MongoDB." },
      { status: 500 }
    );
  }
}
