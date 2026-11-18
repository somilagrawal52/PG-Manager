import mongoose from "mongoose";
import {
  DEMO_ORG,
  DEMO_PROFILES,
  DEMO_PROPERTIES,
  DEMO_ROOMS,
  DEMO_BEDS,
  DEMO_RESIDENTS,
  DEMO_STAYS,
  DEMO_RENT_CHARGES,
  DEMO_PAYMENTS,
  DEMO_DEPOSIT_TRANSACTIONS,
  DEMO_MAINTENANCE_TICKETS,
  DEMO_NOTIFICATIONS,
} from "../src/lib/demo-data";
import {
  OrgModel,
  ProfileModel,
  PropertyModel,
  RoomModel,
  BedModel,
  ResidentModel,
  StayModel,
  RentChargeModel,
  PaymentModel,
  DepositTransactionModel,
  MaintenanceTicketModel,
  NotificationModel,
} from "../src/lib/mongodb/models";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/staymanage";

export async function seedMongoDatabase() {
  console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(" Connected to MongoDB successfully.");

  // Clear existing collections
  await Promise.all([
    OrgModel.deleteMany({}),
    ProfileModel.deleteMany({}),
    PropertyModel.deleteMany({}),
    RoomModel.deleteMany({}),
    BedModel.deleteMany({}),
    ResidentModel.deleteMany({}),
    StayModel.deleteMany({}),
    RentChargeModel.deleteMany({}),
    PaymentModel.deleteMany({}),
    DepositTransactionModel.deleteMany({}),
    MaintenanceTicketModel.deleteMany({}),
    NotificationModel.deleteMany({}),
  ]);

  console.log("🧹 Cleared old collections.");

  // Insert Organization
  await OrgModel.create(DEMO_ORG);

  // Insert Profiles
  await ProfileModel.insertMany(DEMO_PROFILES);

  // Insert Properties
  await PropertyModel.insertMany(DEMO_PROPERTIES);

  // Insert Rooms
  await RoomModel.insertMany(DEMO_ROOMS);

  // Insert Beds
  await BedModel.insertMany(DEMO_BEDS);

  // Insert Residents
  await ResidentModel.insertMany(DEMO_RESIDENTS);

  // Insert Stays
  await StayModel.insertMany(DEMO_STAYS);

  // Insert Rent Charges
  await RentChargeModel.insertMany(DEMO_RENT_CHARGES);

  // Insert Payments
  await PaymentModel.insertMany(DEMO_PAYMENTS);

  // Insert Deposit Transactions
  await DepositTransactionModel.insertMany(DEMO_DEPOSIT_TRANSACTIONS);

  // Insert Maintenance Tickets
  await MaintenanceTicketModel.insertMany(DEMO_MAINTENANCE_TICKETS);

  // Insert Notifications
  await NotificationModel.insertMany(DEMO_NOTIFICATIONS);

  console.log("=================================================");
  console.log("✨ MongoDB Seed Completed Successfully!");
  console.log(`  - Database: staymanage at ${MONGODB_URI}`);
  console.log(`  - Properties: ${DEMO_PROPERTIES.length}`);
  console.log(`  - Rooms: ${DEMO_ROOMS.length}`);
  console.log(`  - Beds: ${DEMO_BEDS.length}`);
  console.log(`  - Residents: ${DEMO_RESIDENTS.length}`);
  console.log(`  - Rent Charges: ${DEMO_RENT_CHARGES.length}`);
  console.log(`  - Payments: ${DEMO_PAYMENTS.length}`);
  console.log(`  - Deposit Entries: ${DEMO_DEPOSIT_TRANSACTIONS.length}`);
  console.log(`  - Tickets: ${DEMO_MAINTENANCE_TICKETS.length}`);
  console.log("=================================================");
}

if (require.main === module) {
  seedMongoDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ MongoDB Seed Error:", err);
      process.exit(1);
    });
}
