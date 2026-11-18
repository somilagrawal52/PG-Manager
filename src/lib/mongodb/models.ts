import mongoose, { Schema, Model } from "mongoose";

// 1. Organization
const OrganizationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    contact_email: { type: String },
    contact_phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    gst_number: { type: String },
    currency: { type: String, default: "INR" },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { timestamps: true }
);

// 2. Profile
const ProfileSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ["owner", "manager", "resident"], default: "resident" },
    avatar_url: { type: String },
  },
  { timestamps: true }
);

// 3. Property
const PropertySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organization_id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    property_type: { type: String, enum: ["pg", "hostel", "co_living"], default: "pg" },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    contact_phone: { type: String, required: true },
    contact_email: { type: String },
    total_floors: { type: Number, default: 1 },
    rules_and_policies: { type: String },
    amenities: { type: [String], default: [] },
    image_url: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 4. Room
const RoomSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    property_id: { type: String, required: true, index: true },
    room_number: { type: String, required: true },
    floor_number: { type: Number, default: 1 },
    room_type: { type: String, enum: ["single", "double", "triple", "four_plus"], default: "double" },
    capacity: { type: Number, default: 2 },
    base_rent_paise: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    status: { type: String, enum: ["active", "maintenance", "inactive"], default: "active" },
  },
  { timestamps: true }
);
RoomSchema.index({ property_id: 1, room_number: 1 }, { unique: true });

// 5. Bed
const BedSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    room_id: { type: String, required: true, index: true },
    property_id: { type: String, required: true, index: true },
    bed_identifier: { type: String, required: true },
    status: { type: String, enum: ["available", "occupied", "maintenance"], default: "available" },
    notes: { type: String },
  },
  { timestamps: true }
);
BedSchema.index({ room_id: 1, bed_identifier: 1 }, { unique: true });

// 6. Resident
const ResidentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organization_id: { type: String, required: true, index: true },
    profile_id: { type: String },
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    emergency_contact_name: { type: String },
    emergency_contact_phone: { type: String },
    permanent_address: { type: String },
    id_proof_type: { type: String },
    id_proof_url: { type: String },
    status: { type: String, enum: ["upcoming", "active", "notice", "checked_out"], default: "active" },
    notes: { type: String },
  },
  { timestamps: true }
);

// 7. Stay
const StaySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    resident_id: { type: String, required: true, index: true },
    bed_id: { type: String, required: true, index: true },
    property_id: { type: String, required: true, index: true },
    check_in_date: { type: String, required: true },
    expected_check_out_date: { type: String },
    actual_check_out_date: { type: String },
    monthly_rent_paise: { type: Number, required: true },
    security_deposit_paise: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
  },
  { timestamps: true }
);
// CRITICAL INVARIANT: Unique active stay per bed!
StaySchema.index(
  { bed_id: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

// 8. RentCharge
const RentChargeSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organization_id: { type: String, required: true, index: true },
    property_id: { type: String, required: true, index: true },
    resident_id: { type: String, required: true, index: true },
    stay_id: { type: String, required: true, index: true },
    billing_month: { type: String, required: true },
    due_date: { type: String, required: true },
    amount_paise: { type: Number, required: true },
    late_fee_paise: { type: Number, default: 0 },
    amount_paid_paise: { type: Number, default: 0 },
    status: { type: String, enum: ["upcoming", "unpaid", "partially_paid", "paid", "overdue"], default: "unpaid" },
    notes: { type: String },
  },
  { timestamps: true }
);
// CRITICAL INVARIANT: One charge per stay per billing month (idempotency)
RentChargeSchema.index({ stay_id: 1, billing_month: 1 }, { unique: true });

// 9. Payment
const PaymentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organization_id: { type: String, required: true },
    property_id: { type: String, required: true },
    resident_id: { type: String, required: true, index: true },
    rent_charge_id: { type: String },
    receipt_number: { type: String, required: true, unique: true },
    amount_paise: { type: Number, required: true },
    payment_method: { type: String, enum: ["cash", "upi", "bank_transfer", "cheque", "other"], default: "upi" },
    payment_date: { type: String, required: true },
    reference_number: { type: String },
    notes: { type: String },
    recorded_by: { type: String },
  },
  { timestamps: true }
);

// 10. DepositTransaction
const DepositTransactionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    resident_id: { type: String, required: true, index: true },
    stay_id: { type: String, required: true, index: true },
    property_id: { type: String, required: true },
    transaction_type: { type: String, enum: ["collected", "deduction", "refund"], required: true },
    amount_paise: { type: Number, required: true },
    reason: { type: String, required: true },
    payment_method: { type: String, default: "upi" },
    reference_number: { type: String },
    transaction_date: { type: String, required: true },
  },
  { timestamps: true }
);

// 11. MaintenanceTicket
const TicketCommentSchema = new Schema({
  id: { type: String, required: true },
  ticket_id: { type: String, required: true },
  author_id: { type: String },
  author_name: { type: String, required: true },
  comment: { type: String, required: true },
  is_internal: { type: Boolean, default: false },
  created_at: { type: String, default: () => new Date().toISOString() },
});

const MaintenanceTicketSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organization_id: { type: String, required: true },
    property_id: { type: String, required: true },
    room_id: { type: String },
    resident_id: { type: String, required: true, index: true },
    ticket_number: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["electrical", "plumbing", "furniture", "cleaning", "internet", "other"],
      default: "other",
    },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    image_url: { type: String },
    assigned_to: { type: String },
    resolved_at: { type: String },
    comments: { type: [TicketCommentSchema], default: [] },
  },
  { timestamps: true }
);

// 12. Notification
const NotificationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    organization_id: { type: String, required: true },
    user_id: { type: String },
    resident_id: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const OrgModel: Model<any> = mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);
export const ProfileModel: Model<any> = mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
export const PropertyModel: Model<any> = mongoose.models.Property || mongoose.model("Property", PropertySchema);
export const RoomModel: Model<any> = mongoose.models.Room || mongoose.model("Room", RoomSchema);
export const BedModel: Model<any> = mongoose.models.Bed || mongoose.model("Bed", BedSchema);
export const ResidentModel: Model<any> = mongoose.models.Resident || mongoose.model("Resident", ResidentSchema);
export const StayModel: Model<any> = mongoose.models.Stay || mongoose.model("Stay", StaySchema);
export const RentChargeModel: Model<any> = mongoose.models.RentCharge || mongoose.model("RentCharge", RentChargeSchema);
export const PaymentModel: Model<any> = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export const DepositTransactionModel: Model<any> =
  mongoose.models.DepositTransaction || mongoose.model("DepositTransaction", DepositTransactionSchema);
export const MaintenanceTicketModel: Model<any> =
  mongoose.models.MaintenanceTicket || mongoose.model("MaintenanceTicket", MaintenanceTicketSchema);
export const NotificationModel: Model<any> =
  mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
