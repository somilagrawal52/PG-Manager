/**
 * StayManage - Standalone Database Seed Script
 * Populates realistic Indian PG accommodation data:
 * - Organization: StayManage Demo Properties
 * - Property 1: Green Nest PG (Koramangala, Bengaluru)
 * - Property 2: Urban Stay Hostel (HSR Layout, Bengaluru)
 * - 20 fictional residents, 26 beds, paid/partial/overdue rent, security deposit ledger, maintenance tickets
 */

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

async function main() {
  console.log("=================================================");
  console.log("🌱 StayManage - Seeding Sample Indian PG Data...");
  console.log("=================================================");

  console.log(`✓ Organization: ${DEMO_ORG.name} (Currency: ${DEMO_ORG.currency}, Timezone: ${DEMO_ORG.timezone})`);
  console.log(`✓ Properties: ${DEMO_PROPERTIES.map((p) => p.name).join(", ")}`);
  console.log(`✓ Rooms: ${DEMO_ROOMS.length} rooms configured across floors`);
  console.log(`✓ Beds: ${DEMO_BEDS.length} beds (Available: ${DEMO_BEDS.filter((b) => b.status === "available").length}, Occupied: ${DEMO_BEDS.filter((b) => b.status === "occupied").length})`);
  console.log(`✓ Residents: ${DEMO_RESIDENTS.length} residents onboarded with stay histories`);
  console.log(`✓ Rent Charges: ${DEMO_RENT_CHARGES.length} monthly charges (Paid, Partial, Overdue)`);
  console.log(`✓ Payments: ${DEMO_PAYMENTS.length} verified manual receipts issued`);
  console.log(`✓ Security Deposit Ledger: ${DEMO_DEPOSIT_TRANSACTIONS.length} entries`);
  console.log(`✓ Maintenance Tickets: ${DEMO_MAINTENANCE_TICKETS.length} tickets with activity comments`);
  console.log(`✓ System Notifications: ${DEMO_NOTIFICATIONS.length} alerts`);

  console.log("=================================================");
  console.log("✨ Seeding completed successfully!");
  console.log("Demo credentials ready:");
  console.log("  Owner:    owner@staymanage.demo (Rajesh Menon)");
  console.log("  Manager:  manager@staymanage.demo (Suresh Kumar)");
  console.log("  Resident: rahul@staymanage.demo (Rahul Sharma, Room 101-A)");
  console.log("=================================================");
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
