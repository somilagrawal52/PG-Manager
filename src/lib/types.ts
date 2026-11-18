export type UserRole = 'owner' | 'manager' | 'resident';

export type PropertyType = 'pg' | 'hostel' | 'co_living';
export type RoomType = 'single' | 'double' | 'triple' | 'four_plus';
export type OperationalStatus = 'active' | 'maintenance' | 'inactive';
export type BedStatus = 'available' | 'occupied' | 'maintenance';
export type ResidentStatus = 'upcoming' | 'active' | 'notice' | 'checked_out';
export type StayStatus = 'active' | 'completed' | 'cancelled';
export type RentStatus = 'upcoming' | 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other';
export type DepositTransactionType = 'collected' | 'deduction' | 'refund';
export type TicketCategory = 'electrical' | 'plumbing' | 'furniture' | 'cleaning' | 'internet' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type NotificationType = 'rent_due' | 'overdue_rent' | 'move_out_reminder' | 'ticket_update' | 'announcement';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  city?: string;
  state?: string;
  gst_number?: string;
  currency: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  property_type: PropertyType;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contact_phone: string;
  contact_email?: string;
  total_floors: number;
  rules_and_policies?: string;
  amenities: string[];
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Room {
  id: string;
  property_id: string;
  room_number: string;
  floor_number: number;
  room_type: RoomType;
  capacity: number;
  base_rent_paise: number; // e.g. 700000 = ₹7,000
  amenities: string[];
  status: OperationalStatus;
  created_at: string;
  beds?: Bed[];
}

export interface Bed {
  id: string;
  room_id: string;
  property_id: string;
  bed_identifier: string; // e.g. "101-A"
  status: BedStatus;
  notes?: string;
  created_at: string;
  room?: Room;
  current_stay?: Stay;
  current_resident?: Resident;
}

export interface Resident {
  id: string;
  organization_id: string;
  profile_id?: string;
  full_name: string;
  phone: string;
  email?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  permanent_address?: string;
  id_proof_type?: string;
  id_proof_url?: string;
  status: ResidentStatus;
  notes?: string;
  created_at: string;
  current_stay?: Stay;
}

export interface Stay {
  id: string;
  resident_id: string;
  bed_id: string;
  property_id: string;
  check_in_date: string;
  expected_check_out_date?: string;
  actual_check_out_date?: string;
  monthly_rent_paise: number;
  security_deposit_paise: number;
  status: StayStatus;
  created_at: string;
  resident?: Resident;
  bed?: Bed;
  property?: Property;
  room?: Room;
}

export interface RentCharge {
  id: string;
  organization_id: string;
  property_id: string;
  resident_id: string;
  stay_id: string;
  billing_month: string; // "YYYY-MM-01"
  due_date: string;
  amount_paise: number;
  late_fee_paise: number;
  amount_paid_paise: number;
  status: RentStatus;
  notes?: string;
  created_at: string;
  resident?: Resident;
  property?: Property;
}

export interface Payment {
  id: string;
  organization_id: string;
  property_id: string;
  resident_id: string;
  rent_charge_id?: string;
  receipt_number: string;
  amount_paise: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  recorded_by?: string;
  created_at: string;
  resident?: Resident;
  property?: Property;
}

export interface DepositTransaction {
  id: string;
  resident_id: string;
  stay_id: string;
  property_id: string;
  transaction_type: DepositTransactionType;
  amount_paise: number;
  reason: string;
  payment_method: PaymentMethod;
  reference_number?: string;
  transaction_date: string;
  created_at: string;
}

export interface MaintenanceTicket {
  id: string;
  organization_id: string;
  property_id: string;
  room_id?: string;
  resident_id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  image_url?: string;
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  resident?: Resident;
  room?: Room;
  property?: Property;
  comments?: TicketComment[];
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id?: string;
  author_name: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  organization_id: string;
  user_id?: string;
  resident_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  performed_by?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

// Summary Metrics for Dashboard
export interface DashboardStats {
  totalProperties: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number; // percentage e.g. 85.5
  rentCollectedThisMonthPaise: number;
  rentOutstandingPaise: number;
  overdueRentCount: number;
  openTicketsCount: number;
}
