import {
  Organization,
  Profile,
  Property,
  Room,
  Bed,
  Resident,
  Stay,
  RentCharge,
  Payment,
  DepositTransaction,
  MaintenanceTicket,
  Notification,
  DashboardStats,
  UserRole,
} from "./types";
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
} from "./demo-data";
import { calculateDepositBalance } from "./utils";

interface AppState {
  currentRole: UserRole;
  currentUserId: string;
  organization: Organization;
  profiles: Profile[];
  properties: Property[];
  rooms: Room[];
  beds: Bed[];
  residents: Resident[];
  stays: Stay[];
  rentCharges: RentCharge[];
  payments: Payment[];
  depositTransactions: DepositTransaction[];
  maintenanceTickets: MaintenanceTicket[];
  notifications: Notification[];
}

const STORAGE_KEY = "staymanage_app_state_v1";

function getInitialState(): AppState {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback if localStorage read fails
    }
  }

  return {
    currentRole: "owner",
    currentUserId: "user-owner-001",
    organization: DEMO_ORG,
    profiles: DEMO_PROFILES,
    properties: DEMO_PROPERTIES,
    rooms: DEMO_ROOMS,
    beds: DEMO_BEDS,
    residents: DEMO_RESIDENTS,
    stays: DEMO_STAYS,
    rentCharges: DEMO_RENT_CHARGES,
    payments: DEMO_PAYMENTS,
    depositTransactions: DEMO_DEPOSIT_TRANSACTIONS,
    maintenanceTickets: DEMO_MAINTENANCE_TICKETS,
    notifications: DEMO_NOTIFICATIONS,
  };
}

class Store {
  private state: AppState = getInitialState();
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      // Re-hydrate on window focus or storage event
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            this.state = JSON.parse(e.newValue);
            this.notify();
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  private save() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Ignore quota errors
      }
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): AppState {
    return this.state;
  }

  resetToDemo() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.state = {
      currentRole: "owner",
      currentUserId: "user-owner-001",
      organization: DEMO_ORG,
      profiles: DEMO_PROFILES,
      properties: DEMO_PROPERTIES,
      rooms: DEMO_ROOMS,
      beds: DEMO_BEDS,
      residents: DEMO_RESIDENTS,
      stays: DEMO_STAYS,
      rentCharges: DEMO_RENT_CHARGES,
      payments: DEMO_PAYMENTS,
      depositTransactions: DEMO_DEPOSIT_TRANSACTIONS,
      maintenanceTickets: DEMO_MAINTENANCE_TICKETS,
      notifications: DEMO_NOTIFICATIONS,
    };
    this.save();
  }

  // Role & Session
  setRole(role: UserRole, userId?: string) {
    this.state.currentRole = role;
    if (userId) {
      this.state.currentUserId = userId;
    } else {
      if (role === "owner") this.state.currentUserId = "user-owner-001";
      else if (role === "manager") this.state.currentUserId = "user-manager-001";
      else if (role === "resident") this.state.currentUserId = "user-resident-001";
    }
    this.save();
  }

  getCurrentUser(): Profile | undefined {
    return this.state.profiles.find((p) => p.id === this.state.currentUserId);
  }

  // Properties
  getProperties(): Property[] {
    if (this.state.currentRole === "manager") {
      // Manager assigned to Green Nest PG in demo
      return this.state.properties.filter((p) => p.id === "prop-gn-001");
    }
    return this.state.properties;
  }

  getProperty(id: string): Property | undefined {
    return this.state.properties.find((p) => p.id === id);
  }

  createProperty(prop: Omit<Property, "id" | "organization_id" | "created_at">): Property {
    const newProp: Property = {
      ...prop,
      id: `prop-${Date.now()}`,
      organization_id: this.state.organization.id,
      created_at: new Date().toISOString(),
    };
    this.state.properties = [newProp, ...this.state.properties];
    this.save();
    return newProp;
  }

  updateProperty(id: string, updates: Partial<Property>): Property {
    const index = this.state.properties.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Property not found");
    const updated = { ...this.state.properties[index], ...updates };
    this.state.properties[index] = updated;
    this.save();
    return updated;
  }

  // Rooms & Beds
  getRooms(propertyId?: string): Room[] {
    let list = this.state.rooms;
    if (propertyId) {
      list = list.filter((r) => r.property_id === propertyId);
    }
    return list.map((room) => ({
      ...room,
      beds: this.getBeds(room.id),
    }));
  }

  getRoom(id: string): Room | undefined {
    const room = this.state.rooms.find((r) => r.id === id);
    if (!room) return undefined;
    return {
      ...room,
      beds: this.getBeds(room.id),
    };
  }

  createRoom(roomData: Omit<Room, "id" | "created_at" | "beds">): Room {
    const roomId = `room-${Date.now()}`;
    const newRoom: Room = {
      ...roomData,
      id: roomId,
      created_at: new Date().toISOString(),
    };

    // Auto-create beds according to room capacity
    const newBeds: Bed[] = [];
    const letters = ["A", "B", "C", "D", "E", "F"];
    for (let i = 0; i < newRoom.capacity; i++) {
      const letter = letters[i] || `${i + 1}`;
      newBeds.push({
        id: `bed-${roomId}-${letter.toLowerCase()}`,
        room_id: roomId,
        property_id: newRoom.property_id,
        bed_identifier: `${newRoom.room_number}-${letter}`,
        status: "available",
        created_at: new Date().toISOString(),
      });
    }

    this.state.rooms = [...this.state.rooms, newRoom];
    this.state.beds = [...this.state.beds, ...newBeds];
    this.save();

    return {
      ...newRoom,
      beds: newBeds,
    };
  }

  getBeds(roomId?: string): Bed[] {
    let list = this.state.beds;
    if (roomId) {
      list = list.filter((b) => b.room_id === roomId);
    }
    return list.map((bed) => {
      const activeStay = this.state.stays.find((s) => s.bed_id === bed.id && s.status === "active");
      const resident = activeStay ? this.state.residents.find((r) => r.id === activeStay.resident_id) : undefined;
      const room = this.state.rooms.find((r) => r.id === bed.room_id);
      return {
        ...bed,
        current_stay: activeStay,
        current_resident: resident,
        room,
      };
    });
  }

  // Residents & Allocation
  getResidents(): Resident[] {
    return this.state.residents.map((res) => {
      const currentStay = this.state.stays.find((s) => s.resident_id === res.id && s.status === "active");
      let stayWithDetails = currentStay;
      if (currentStay) {
        const bed = this.state.beds.find((b) => b.id === currentStay.bed_id);
        const room = bed ? this.state.rooms.find((r) => r.id === bed.room_id) : undefined;
        const property = this.state.properties.find((p) => p.id === currentStay.property_id);
        stayWithDetails = { ...currentStay, bed, room, property };
      }
      return {
        ...res,
        current_stay: stayWithDetails,
      };
    });
  }

  getResident(id: string): Resident | undefined {
    const residents = this.getResidents();
    return residents.find((r) => r.id === id);
  }

  registerResident(
    residentData: Omit<Resident, "id" | "organization_id" | "created_at">,
    allocation?: {
      bed_id: string;
      property_id: string;
      monthly_rent_paise: number;
      security_deposit_paise: number;
      check_in_date: string;
      deposit_payment_method?: "cash" | "upi" | "bank_transfer";
    }
  ): Resident {
    const resId = `res-${Date.now()}`;
    const newResident: Resident = {
      ...residentData,
      id: resId,
      organization_id: this.state.organization.id,
      created_at: new Date().toISOString(),
    };

    if (allocation) {
      // Invariant check: Check if bed is already occupied!
      const existingActiveStay = this.state.stays.find(
        (s) => s.bed_id === allocation.bed_id && s.status === "active"
      );
      if (existingActiveStay) {
        throw new Error("Critical Error: Bed is already occupied by an active resident.");
      }

      const stayId = `stay-${Date.now()}`;
      const newStay: Stay = {
        id: stayId,
        resident_id: resId,
        bed_id: allocation.bed_id,
        property_id: allocation.property_id,
        check_in_date: allocation.check_in_date,
        monthly_rent_paise: allocation.monthly_rent_paise,
        security_deposit_paise: allocation.security_deposit_paise,
        status: "active",
        created_at: new Date().toISOString(),
      };

      // Mark bed as occupied
      const bedIndex = this.state.beds.findIndex((b) => b.id === allocation.bed_id);
      if (bedIndex !== -1) {
        this.state.beds[bedIndex] = { ...this.state.beds[bedIndex], status: "occupied" };
      }

      // Record deposit collection if amount > 0
      if (allocation.security_deposit_paise > 0) {
        const depositTx: DepositTransaction = {
          id: `dep-${Date.now()}`,
          resident_id: resId,
          stay_id: stayId,
          property_id: allocation.property_id,
          transaction_type: "collected",
          amount_paise: allocation.security_deposit_paise,
          reason: "Security deposit collected during onboarding",
          payment_method: allocation.deposit_payment_method || "upi",
          transaction_date: allocation.check_in_date,
          created_at: new Date().toISOString(),
        };
        this.state.depositTransactions = [depositTx, ...this.state.depositTransactions];
      }

      this.state.stays = [...this.state.stays, newStay];
    }

    this.state.residents = [newResident, ...this.state.residents];
    this.save();
    return this.getResident(resId)!;
  }

  transferBed(residentId: string, newBedId: string): void {
    const currentStayIndex = this.state.stays.findIndex(
      (s) => s.resident_id === residentId && s.status === "active"
    );
    if (currentStayIndex === -1) {
      throw new Error("Active stay not found for resident");
    }

    // Verify target bed is available
    const targetBed = this.state.beds.find((b) => b.id === newBedId);
    if (!targetBed) throw new Error("Target bed does not exist");
    if (targetBed.status !== "available") {
      throw new Error("Target bed is not available for transfer");
    }

    const currentStay = this.state.stays[currentStayIndex];
    const oldBedId = currentStay.bed_id;

    // Release old bed
    const oldBedIdx = this.state.beds.findIndex((b) => b.id === oldBedId);
    if (oldBedIdx !== -1) {
      this.state.beds[oldBedIdx] = { ...this.state.beds[oldBedIdx], status: "available" };
    }

    // Occupy new bed
    const newBedIdx = this.state.beds.findIndex((b) => b.id === newBedId);
    if (newBedIdx !== -1) {
      this.state.beds[newBedIdx] = { ...this.state.beds[newBedIdx], status: "occupied" };
    }

    // Update stay with new bed
    this.state.stays[currentStayIndex] = {
      ...currentStay,
      bed_id: newBedId,
      property_id: targetBed.property_id,
    };

    this.save();
  }

  // Move-Out / Checkout Workflow
  checkoutResident(params: {
    residentId: string;
    checkOutDate: string;
    deductionPaise: number;
    deductionReason?: string;
    refundPaise: number;
    refundMethod?: "cash" | "upi" | "bank_transfer";
  }): void {
    const stayIndex = this.state.stays.findIndex(
      (s) => s.resident_id === params.residentId && s.status === "active"
    );
    if (stayIndex === -1) {
      throw new Error("No active stay found for this resident");
    }

    const stay = this.state.stays[stayIndex];

    // Check deposit balance
    const existingTx = this.state.depositTransactions.filter((tx) => tx.stay_id === stay.id);
    const balanceInfo = calculateDepositBalance(existingTx);

    const totalDeductionAndRefund = params.deductionPaise + params.refundPaise;
    if (totalDeductionAndRefund > balanceInfo.balance) {
      throw new Error(
        `Settlement total (₹${totalDeductionAndRefund / 100}) cannot exceed available deposit balance (₹${balanceInfo.balance / 100}).`
      );
    }

    // 1. Record deduction if any
    if (params.deductionPaise > 0) {
      this.state.depositTransactions = [
        {
          id: `dep-deduct-${Date.now()}`,
          resident_id: params.residentId,
          stay_id: stay.id,
          property_id: stay.property_id,
          transaction_type: "deduction",
          amount_paise: params.deductionPaise,
          reason: params.deductionReason || "Move-out inspection deduction (damages/cleaning/notice shortfall)",
          payment_method: "other",
          transaction_date: params.checkOutDate,
          created_at: new Date().toISOString(),
        },
        ...this.state.depositTransactions,
      ];
    }

    // 2. Record refund if any
    if (params.refundPaise > 0) {
      this.state.depositTransactions = [
        {
          id: `dep-ref-${Date.now()}`,
          resident_id: params.residentId,
          stay_id: stay.id,
          property_id: stay.property_id,
          transaction_type: "refund",
          amount_paise: params.refundPaise,
          reason: "Security deposit settlement refund on checkout",
          payment_method: params.refundMethod || "upi",
          transaction_date: params.checkOutDate,
          created_at: new Date().toISOString(),
        },
        ...this.state.depositTransactions,
      ];
    }

    // 3. Mark stay completed and record check-out date
    this.state.stays[stayIndex] = {
      ...stay,
      status: "completed",
      actual_check_out_date: params.checkOutDate,
    };

    // 4. Update resident status to checked_out (history preserved)
    const resIndex = this.state.residents.findIndex((r) => r.id === params.residentId);
    if (resIndex !== -1) {
      this.state.residents[resIndex] = {
        ...this.state.residents[resIndex],
        status: "checked_out",
      };
    }

    // 5. Release bed back to available!
    const bedIndex = this.state.beds.findIndex((b) => b.id === stay.bed_id);
    if (bedIndex !== -1) {
      this.state.beds[bedIndex] = {
        ...this.state.beds[bedIndex],
        status: "available",
      };
    }

    this.save();
  }

  // Rent & Billing Management
  getRentCharges(propertyId?: string): RentCharge[] {
    let list = this.state.rentCharges;
    if (propertyId) {
      list = list.filter((rc) => rc.property_id === propertyId);
    }
    return list.map((rc) => {
      const resident = this.state.residents.find((r) => r.id === rc.resident_id);
      const property = this.state.properties.find((p) => p.id === rc.property_id);
      return {
        ...rc,
        resident,
        property,
      };
    });
  }

  // Idempotent Monthly Rent Generation
  generateMonthlyRentCharges(billingMonth: string, dueDate: string): { generated: number; skipped: number } {
    let generated = 0;
    let skipped = 0;

    const activeStays = this.state.stays.filter((s) => s.status === "active");

    for (const stay of activeStays) {
      // Check if charge already exists for this stay and month
      const exists = this.state.rentCharges.some(
        (rc) => rc.stay_id === stay.id && rc.billing_month === billingMonth
      );

      if (exists) {
        skipped++;
        continue;
      }

      const newCharge: RentCharge = {
        id: `charge-${Date.now()}-${generated}`,
        organization_id: this.state.organization.id,
        property_id: stay.property_id,
        resident_id: stay.resident_id,
        stay_id: stay.id,
        billing_month: billingMonth,
        due_date: dueDate,
        amount_paise: stay.monthly_rent_paise,
        late_fee_paise: 0,
        amount_paid_paise: 0,
        status: "unpaid",
        notes: `Monthly rent generated for ${billingMonth}`,
        created_at: new Date().toISOString(),
      };

      this.state.rentCharges = [newCharge, ...this.state.rentCharges];
      generated++;
    }

    this.save();
    return { generated, skipped };
  }

  // Record Payment with precise charge allocation & balance update
  recordPayment(params: {
    resident_id: string;
    rent_charge_id?: string;
    amount_paise: number;
    payment_method: "cash" | "upi" | "bank_transfer" | "cheque" | "other";
    payment_date: string;
    reference_number?: string;
    notes?: string;
  }): Payment {
    const resident = this.state.residents.find((r) => r.id === params.resident_id);
    if (!resident) throw new Error("Resident not found");

    const stay = this.state.stays.find((s) => s.resident_id === params.resident_id && s.status === "active");
    const propertyId = stay?.property_id || this.state.properties[0].id;

    const receiptNum = `RCP-${Date.now().toString().slice(-8)}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      organization_id: this.state.organization.id,
      property_id: propertyId,
      resident_id: params.resident_id,
      rent_charge_id: params.rent_charge_id,
      receipt_number: receiptNum,
      amount_paise: params.amount_paise,
      payment_method: params.payment_method,
      payment_date: params.payment_date,
      reference_number: params.reference_number,
      notes: params.notes,
      recorded_by: this.state.currentUserId,
      created_at: new Date().toISOString(),
    };

    // If allocated to a specific rent charge, update that charge
    if (params.rent_charge_id) {
      const chargeIdx = this.state.rentCharges.findIndex((rc) => rc.id === params.rent_charge_id);
      if (chargeIdx !== -1) {
        const charge = this.state.rentCharges[chargeIdx];
        const newPaid = charge.amount_paid_paise + params.amount_paise;
        const totalDue = charge.amount_paise + charge.late_fee_paise;

        let newStatus = charge.status;
        if (newPaid >= totalDue) {
          newStatus = "paid";
        } else if (newPaid > 0) {
          newStatus = "partially_paid";
        }

        this.state.rentCharges[chargeIdx] = {
          ...charge,
          amount_paid_paise: newPaid,
          status: newStatus,
        };
      }
    } else {
      // Allocate automatically to earliest unpaid/partial charge for this resident
      const unpaidCharges = this.state.rentCharges
        .filter((rc) => rc.resident_id === params.resident_id && rc.status !== "paid")
        .sort((a, b) => a.due_date.localeCompare(b.due_date));

      let remainingPayment = params.amount_paise;
      for (const charge of unpaidCharges) {
        if (remainingPayment <= 0) break;
        const chargeIdx = this.state.rentCharges.findIndex((c) => c.id === charge.id);
        const totalDue = charge.amount_paise + charge.late_fee_paise;
        const outstanding = totalDue - charge.amount_paid_paise;

        const applyAmount = Math.min(remainingPayment, outstanding);
        const newPaid = charge.amount_paid_paise + applyAmount;
        remainingPayment -= applyAmount;

        this.state.rentCharges[chargeIdx] = {
          ...charge,
          amount_paid_paise: newPaid,
          status: newPaid >= totalDue ? "paid" : "partially_paid",
        };
      }
    }

    this.state.payments = [newPayment, ...this.state.payments];
    this.save();
    return newPayment;
  }

  getPayments(propertyId?: string): Payment[] {
    let list = this.state.payments;
    if (propertyId) {
      list = list.filter((p) => p.property_id === propertyId);
    }
    return list.map((pay) => ({
      ...pay,
      resident: this.state.residents.find((r) => r.id === pay.resident_id),
      property: this.state.properties.find((p) => p.id === pay.property_id),
    }));
  }

  // Security Deposit Ledger
  getDepositTransactions(residentId?: string): DepositTransaction[] {
    let list = this.state.depositTransactions;
    if (residentId) {
      list = list.filter((tx) => tx.resident_id === residentId);
    }
    return list;
  }

  // Maintenance Tickets
  getTickets(propertyId?: string): MaintenanceTicket[] {
    let list = this.state.maintenanceTickets;
    if (this.state.currentRole === "resident") {
      // Resident can ONLY see their own tickets!
      list = list.filter((t) => t.resident_id === "res-001");
    } else if (propertyId) {
      list = list.filter((t) => t.property_id === propertyId);
    }

    return list.map((t) => ({
      ...t,
      resident: this.state.residents.find((r) => r.id === t.resident_id),
      room: this.state.rooms.find((r) => r.id === t.room_id),
      property: this.state.properties.find((p) => p.id === t.property_id),
    }));
  }

  createTicket(data: Omit<MaintenanceTicket, "id" | "ticket_number" | "status" | "created_at">): MaintenanceTicket {
    const num = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: MaintenanceTicket = {
      ...data,
      id: `ticket-${Date.now()}`,
      ticket_number: num,
      status: "open",
      created_at: new Date().toISOString(),
      comments: [],
    };
    this.state.maintenanceTickets = [newTicket, ...this.state.maintenanceTickets];
    this.save();
    return newTicket;
  }

  updateTicketStatus(ticketId: string, status: MaintenanceTicket["status"], comment?: string): void {
    const index = this.state.maintenanceTickets.findIndex((t) => t.id === ticketId);
    if (index === -1) throw new Error("Ticket not found");

    const ticket = this.state.maintenanceTickets[index];
    const comments = ticket.comments || [];

    if (comment) {
      comments.push({
        id: `comm-${Date.now()}`,
        ticket_id: ticketId,
        author_name: this.getCurrentUser()?.full_name || "Staff",
        comment,
        is_internal: false,
        created_at: new Date().toISOString(),
      });
    }

    this.state.maintenanceTickets[index] = {
      ...ticket,
      status,
      resolved_at: status === "resolved" || status === "closed" ? new Date().toISOString() : undefined,
      comments,
    };
    this.save();
  }

  // Notifications
  getNotifications(): Notification[] {
    return this.state.notifications;
  }

  markNotificationRead(id: string) {
    const idx = this.state.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.state.notifications[idx] = { ...this.state.notifications[idx], is_read: true };
      this.save();
    }
  }

  // Dashboard Aggregates & KPIs
  getDashboardStats(propertyId?: string): DashboardStats {
    const properties = this.getProperties();
    const rooms = this.getRooms(propertyId);
    const beds = this.getBeds();
    const filteredBeds = propertyId ? beds.filter((b) => b.property_id === propertyId) : beds;

    const totalBeds = filteredBeds.length;
    const occupiedBeds = filteredBeds.filter((b) => b.status === "occupied").length;
    const availableBeds = filteredBeds.filter((b) => b.status === "available").length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 1000) / 10 : 0;

    const charges = this.getRentCharges(propertyId);
    // Rent collected this month
    const rentCollectedThisMonthPaise = charges.reduce((acc, c) => acc + c.amount_paid_paise, 0);

    // Outstanding rent
    const rentOutstandingPaise = charges.reduce((acc, c) => {
      const totalDue = c.amount_paise + c.late_fee_paise;
      const pending = Math.max(0, totalDue - c.amount_paid_paise);
      return acc + pending;
    }, 0);

    const overdueRentCount = charges.filter((c) => c.status === "overdue").length;
    const tickets = this.getTickets(propertyId);
    const openTicketsCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

    return {
      totalProperties: properties.length,
      totalRooms: rooms.length,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate,
      rentCollectedThisMonthPaise,
      rentOutstandingPaise,
      overdueRentCount,
      openTicketsCount,
    };
  }
}

// Global singleton instance
export const appStore = new Store();
