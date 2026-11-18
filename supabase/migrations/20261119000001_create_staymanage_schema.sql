-- ============================================================================
-- StayManage - Smart PG & Hostel Management SaaS
-- Initial Schema & Row Level Security Migration
-- Timezone: Asia/Kolkata default
-- Currency: Exact Integer Paise (1 INR = 100 paise)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    gst_number VARCHAR(50),
    currency VARCHAR(10) DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Profiles (Auth-linked)
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'resident');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- Matches auth.users.id
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL DEFAULT 'resident',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Organization Memberships
CREATE TABLE IF NOT EXISTS organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'manager',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, profile_id)
);

-- 4. Properties (PGs / Hostels)
CREATE TYPE property_type AS ENUM ('pg', 'hostel', 'co_living');

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    property_type property_type NOT NULL DEFAULT 'pg',
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255),
    total_floors INT NOT NULL DEFAULT 1,
    rules_and_policies TEXT,
    amenities JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Property Manager Assignments (Manager scoped properties)
CREATE TABLE IF NOT EXISTS property_manager_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, profile_id)
);

-- 6. Rooms
CREATE TYPE room_type AS ENUM ('single', 'double', 'triple', 'four_plus');
CREATE TYPE operational_status AS ENUM ('active', 'maintenance', 'inactive');

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    floor_number INT NOT NULL DEFAULT 1,
    room_type room_type NOT NULL DEFAULT 'double',
    capacity INT NOT NULL DEFAULT 2,
    base_rent_paise BIGINT NOT NULL DEFAULT 600000, -- in paise (e.g. 600000 = ₹6,000)
    amenities JSONB DEFAULT '[]'::jsonb,
    status operational_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, room_number)
);

-- 7. Beds
CREATE TYPE bed_status AS ENUM ('available', 'occupied', 'maintenance');

CREATE TABLE IF NOT EXISTS beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    bed_identifier VARCHAR(50) NOT NULL, -- e.g. "101-A"
    status bed_status NOT NULL DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(room_id, bed_identifier)
);

-- 8. Residents (Can exist before auth registration)
CREATE TYPE resident_status AS ENUM ('upcoming', 'active', 'notice', 'checked_out');

CREATE TABLE IF NOT EXISTS residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- linked if tenant signs up
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    permanent_address TEXT,
    id_proof_type VARCHAR(50), -- optional e.g. "College ID", "Driving License"
    id_proof_url TEXT,
    status resident_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Stays / Occupancy Assignments
CREATE TYPE stay_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS stays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE RESTRICT,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    expected_check_out_date DATE,
    actual_check_out_date DATE,
    monthly_rent_paise BIGINT NOT NULL, -- Snapshot at booking
    security_deposit_paise BIGINT NOT NULL DEFAULT 0,
    status stay_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRITICAL BUSINESS INVARIANT 1:
-- A bed CANNOT have more than one active stay simultaneously!
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_bed_occupancy 
ON stays(bed_id) 
WHERE status = 'active';

-- 10. Rent Charges (Monthly Invoices)
CREATE TYPE rent_status AS ENUM ('upcoming', 'unpaid', 'partially_paid', 'paid', 'overdue');

CREATE TABLE IF NOT EXISTS rent_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    stay_id UUID NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
    billing_month DATE NOT NULL, -- Normalized to 1st of the month, e.g. 2026-11-01
    due_date DATE NOT NULL,
    amount_paise BIGINT NOT NULL,
    late_fee_paise BIGINT NOT NULL DEFAULT 0,
    amount_paid_paise BIGINT NOT NULL DEFAULT 0,
    status rent_status NOT NULL DEFAULT 'unpaid',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- CRITICAL BUSINESS INVARIANT 2: Idempotent generation (one charge per stay per month)
    CONSTRAINT unique_stay_billing_month UNIQUE (stay_id, billing_month)
);

-- 11. Payments
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'bank_transfer', 'cheque', 'other');

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    rent_charge_id UUID REFERENCES rent_charges(id) ON DELETE SET NULL,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    amount_paise BIGINT NOT NULL,
    payment_method payment_method NOT NULL DEFAULT 'upi',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_number VARCHAR(100),
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Payment Allocations (Precise ledger allocation)
CREATE TABLE IF NOT EXISTS payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    rent_charge_id UUID NOT NULL REFERENCES rent_charges(id) ON DELETE CASCADE,
    allocated_amount_paise BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Security Deposit Ledger
CREATE TYPE deposit_transaction_type AS ENUM ('collected', 'deduction', 'refund');

CREATE TABLE IF NOT EXISTS deposit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    stay_id UUID NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    transaction_type deposit_transaction_type NOT NULL,
    amount_paise BIGINT NOT NULL,
    reason TEXT NOT NULL,
    payment_method payment_method DEFAULT 'upi',
    reference_number VARCHAR(100),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Maintenance Tickets
CREATE TYPE ticket_category AS ENUM ('electrical', 'plumbing', 'furniture', 'cleaning', 'internet', 'other');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ticket_category NOT NULL DEFAULT 'other',
    priority ticket_priority NOT NULL DEFAULT 'medium',
    status ticket_status NOT NULL DEFAULT 'open',
    image_url TEXT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Ticket Comments
CREATE TABLE IF NOT EXISTS ticket_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES maintenance_tickets(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Notifications
CREATE TYPE notification_type AS ENUM ('rent_due', 'overdue_rent', 'move_out_reminder', 'ticket_update', 'announcement');

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_properties_org ON properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_rooms_property ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_beds_room ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_property ON beds(property_id);
CREATE INDEX IF NOT EXISTS idx_residents_org ON residents(organization_id);
CREATE INDEX IF NOT EXISTS idx_stays_resident ON stays(resident_id);
CREATE INDEX IF NOT EXISTS idx_stays_bed ON stays(bed_id);
CREATE INDEX IF NOT EXISTS idx_rent_charges_resident ON rent_charges(resident_id);
CREATE INDEX IF NOT EXISTS idx_rent_charges_status ON rent_charges(status);
CREATE INDEX IF NOT EXISTS idx_rent_charges_billing_month ON rent_charges(billing_month);
CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_deposit_tx_resident ON deposit_transactions(resident_id);
CREATE INDEX IF NOT EXISTS idx_tickets_org ON maintenance_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_resident ON maintenance_tickets(resident_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Organizations: Accessible by their members
CREATE POLICY "Org members can read their organization" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_memberships
            WHERE organization_memberships.organization_id = organizations.id
            AND organization_memberships.profile_id = auth.uid()
        )
    );

-- Properties: Owners can see all org properties; Managers see assigned properties
CREATE POLICY "Property access policy" ON properties
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_memberships m
            WHERE m.organization_id = properties.organization_id
            AND m.profile_id = auth.uid()
            AND (
                m.role = 'owner'
                OR EXISTS (
                    SELECT 1 FROM property_manager_assignments a
                    WHERE a.property_id = properties.id
                    AND a.profile_id = auth.uid()
                )
            )
        )
    );

-- Residents: Resident users can only see their own resident record
CREATE POLICY "Resident portal access" ON residents
    FOR SELECT USING (
        profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM organization_memberships m
            WHERE m.organization_id = residents.organization_id
            AND m.profile_id = auth.uid()
        )
    );

-- Rent charges: Resident sees only their own; staff sees org charges
CREATE POLICY "Rent charge access" ON rent_charges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM residents r
            WHERE r.id = rent_charges.resident_id
            AND r.profile_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM organization_memberships m
            WHERE m.organization_id = rent_charges.organization_id
            AND m.profile_id = auth.uid()
        )
    );

-- Maintenance tickets: Resident can read and insert their own; staff can view and manage
CREATE POLICY "Maintenance ticket select" ON maintenance_tickets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM residents r
            WHERE r.id = maintenance_tickets.resident_id
            AND r.profile_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM organization_memberships m
            WHERE m.organization_id = maintenance_tickets.organization_id
            AND m.profile_id = auth.uid()
        )
    );

CREATE POLICY "Resident can create tickets" ON maintenance_tickets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM residents r
            WHERE r.id = resident_id
            AND r.profile_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM organization_memberships m
            WHERE m.organization_id = maintenance_tickets.organization_id
            AND m.profile_id = auth.uid()
        )
    );
