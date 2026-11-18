import { describe, it, expect, beforeEach } from "vitest";
import { appStore } from "@/lib/store";
import { calculateDepositBalance, formatINR } from "@/lib/utils";

describe("StayManage Critical Business Logic & Invariants", () => {
  beforeEach(() => {
    appStore.resetToDemo();
  });

  it("1. Prevents two residents from occupying the same bed simultaneously", () => {
    // Bed 101-A is already occupied by Rahul Sharma
    const occupiedBedId = "bed-gn-101-a";

    expect(() => {
      appStore.registerResident(
        {
          full_name: "Illegal Resident",
          phone: "+91 99999 88888",
          status: "active",
        },
        {
          bed_id: occupiedBedId,
          property_id: "prop-gn-001",
          monthly_rent_paise: 700000,
          security_deposit_paise: 1400000,
          check_in_date: "2026-11-19",
        }
      );
    }).toThrow("Critical Error: Bed is already occupied by an active resident.");
  });

  it("2. Guarantees idempotent rent generation (prevents duplicate monthly charges)", () => {
    // For November 2026, demo data already contains rent charges
    const result1 = appStore.generateMonthlyRentCharges("2026-11-01", "2026-11-05");
    // All active stays already have charges for 2026-11-01, so generated should be 0 or only for unbilled
    expect(result1.skipped).toBeGreaterThan(0);

    // Running again for same month must produce 0 new charges
    const result2 = appStore.generateMonthlyRentCharges("2026-11-01", "2026-11-05");
    expect(result2.generated).toBe(0);
    expect(result2.skipped).toBeGreaterThan(0);
  });

  it("3. Correctly handles partial payments and updates outstanding balance", () => {
    // Rahul Sharma prompt scenario:
    // Monthly rent: ₹7,000 (700000 paise)
    // Recorded amount received: ₹3,000 (300000 paise)
    // Outstanding must be exactly ₹4,000 (400000 paise)
    const rahulCharges = appStore.getRentCharges().filter((c) => c.resident_id === "res-001");
    const novCharge = rahulCharges.find((c) => c.billing_month === "2026-11-01")!;

    expect(novCharge.amount_paise).toBe(700000);
    expect(novCharge.amount_paid_paise).toBe(300000);
    expect(novCharge.status).toBe("partially_paid");

    const outstanding = novCharge.amount_paise + novCharge.late_fee_paise - novCharge.amount_paid_paise;
    expect(outstanding).toBe(400000);
    expect(formatINR(outstanding)).toBe("₹4,000");

    // Now record the remaining ₹4,000 payment
    appStore.recordPayment({
      resident_id: "res-001",
      rent_charge_id: novCharge.id,
      amount_paise: 400000,
      payment_method: "upi",
      payment_date: "2026-11-19",
      notes: "Remaining balance cleared",
    });

    const updatedCharge = appStore.getRentCharges().find((c) => c.id === novCharge.id)!;
    expect(updatedCharge.amount_paid_paise).toBe(700000);
    expect(updatedCharge.status).toBe("paid");
  });

  it("4. Prevents security deposit deductions or refunds from exceeding available balance", () => {
    // Rahul Sharma deposit: ₹14,000 collected
    const existingTx = appStore.getDepositTransactions("res-001");
    const balance = calculateDepositBalance(existingTx);
    expect(balance.balance).toBe(1400000); // ₹14,000

    // Attempting to refund or deduct ₹15,000 should fail!
    expect(() => {
      appStore.checkoutResident({
        residentId: "res-001",
        checkOutDate: "2026-11-19",
        deductionPaise: 1000000, // ₹10,000
        refundPaise: 600000, // ₹6,000 (Total: ₹16,000 > ₹14,000 balance)
      });
    }).toThrow(/cannot exceed available deposit balance/);
  });

  it("5. Checkout workflow releases bed back to available while preserving financial history", () => {
    const residentId = "res-001";
    const resident = appStore.getResident(residentId)!;
    const bedId = resident.current_stay!.bed_id;

    // Verify bed is currently occupied
    const bedBefore = appStore.getBeds().find((b) => b.id === bedId)!;
    expect(bedBefore.status).toBe("occupied");

    // Count past payments before checkout
    const paymentsCountBefore = appStore.getPayments().filter((p) => p.resident_id === residentId).length;
    expect(paymentsCountBefore).toBeGreaterThan(0);

    // Complete checkout with valid deduction ₹2,000 and refund ₹12,000
    appStore.checkoutResident({
      residentId,
      checkOutDate: "2026-11-19",
      deductionPaise: 200000,
      deductionReason: "Room deep cleaning & minor paint touchup",
      refundPaise: 1200000,
      refundMethod: "upi",
    });

    // 1. Bed must now be released to 'available'
    const bedAfter = appStore.getBeds().find((b) => b.id === bedId)!;
    expect(bedAfter.status).toBe("available");

    // 2. Resident status must be 'checked_out'
    const residentAfter = appStore.getResident(residentId)!;
    expect(residentAfter.status).toBe("checked_out");

    // 3. Past financial history must be preserved (not deleted)
    const paymentsCountAfter = appStore.getPayments().filter((p) => p.resident_id === residentId).length;
    expect(paymentsCountAfter).toBe(paymentsCountBefore);

    // 4. Deposit transactions must show collected, deduction, and refund
    const depositTxAfter = appStore.getDepositTransactions(residentId);
    expect(depositTxAfter.some((tx) => tx.transaction_type === "deduction")).toBe(true);
    expect(depositTxAfter.some((tx) => tx.transaction_type === "refund")).toBe(true);
  });

  it("6. Restricts resident access to only their own maintenance complaints", () => {
    appStore.setRole("resident", "user-resident-001");
    const tickets = appStore.getTickets();

    // All returned tickets must belong exclusively to res-001
    expect(tickets.length).toBeGreaterThan(0);
    for (const ticket of tickets) {
      expect(ticket.resident_id).toBe("res-001");
    }
  });

  it("7. Restricts manager access to only assigned properties", () => {
    appStore.setRole("manager", "user-manager-001");
    const properties = appStore.getProperties();

    // Suresh Kumar is assigned only to Green Nest PG (prop-gn-001)
    expect(properties.length).toBe(1);
    expect(properties[0].id).toBe("prop-gn-001");
  });
});
