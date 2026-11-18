# StayManage — Smart PG & Hostel Management SaaS 🏢

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing-brightgreen?style=flat&logo=vitest)](https://vitest.dev/)
[![Currency](https://img.shields.io/badge/Currency-INR%20(₹)-green)](https://en.wikipedia.org/wiki/Indian_rupee)
[![Timezone](https://img.shields.io/badge/Timezone-Asia%2FKolkata-orange)](https://www.timeanddate.com/time/zone/india)

**StayManage** is a modern, production-oriented multi-tenant SaaS application tailored specifically for Indian Paying Guest (PG) accommodations, student hostels, and co-living facilities. It replaces fragmented Excel spreadsheets, paper registers, and awkward WhatsApp follow-ups with an intuitive, unified property management system.

---

## 🌟 Key Capabilities

### 1. Multi-Role RBAC (Owner, Manager, Resident)
- **Owner / Admin**: Full organization oversight, multi-property control, room/bed management, monthly rent generation, security deposit ledger, staff permissions, and executive analytics.
- **Property Manager**: Strict scope restriction—managers access only explicitly assigned properties (e.g. Suresh Kumar manages Green Nest PG).
- **Resident / Tenant Portal**: Mobile-first self-service interface where tenants view their room/bed details, check pending dues, download official HRA tax receipts, raise maintenance tickets, and track staff resolution comments.

### 2. Smart Visual Room & Bed Matrix
- Floor-by-floor visual room matrix with single, double, triple, and four-sharing layouts.
- Unique bed identifiers (e.g., `101-A`, `101-B`).
- **Zero Double-Bookings**: Guaranteed single occupancy per bed enforced at the data layer and schema level (`UNIQUE INDEX WHERE status = 'active'`).
- Bed details modal, amenity tagging, and automated bed generation.

### 3. Rent Billing & Manual Payment Ledger
- **Idempotent Monthly Rent Generation**: Safe batch billing—running rent generation multiple times for the same month never creates duplicate charges.
- **Partial Payment Handling**: Exact rupee calculation with status transitions (`unpaid` → `partially_paid` → `paid` / `overdue`).
- **Official Payment Receipts**: Printable and downloadable GST-compliant payment receipts with property address, tenant details, receipt number, UTR reference, and outstanding balance.

### 4. Dedicated Security Deposit Escrow
- Complete separation of security deposits from monthly rental revenue.
- Immutable ledger tracking collections, damage deductions, and refund settlements.
- **Overdraft Protection**: Prohibits deductions or refunds exceeding the resident's available deposit balance.
- **Safe Move-Out / Checkout**: Releases beds back to `available` immediately while preserving complete financial and occupancy history.

### 5. Maintenance & Complaint Ticketing
- Resident ticketing for Electrical, Plumbing, Internet/Wi-Fi, Housekeeping, and Furniture issues.
- Priority levels (`low`, `medium`, `high`, `urgent`) and status workflow (`open` → `in_progress` → `resolved` → `closed`).
- Interactive comment trail connecting resident and property staff.

### 6. Analytics, KPIs & CSV Exporters
- Real-time executive dashboard featuring:
  - Total properties, rooms, beds, and occupancy rate (%)
  - Monthly rent collections (₹) vs. outstanding dues (₹)
  - Overdue accounts tracker
  - Recharts revenue trends and property occupancy charts
- 1-Click CSV exports for Full Occupancy, Vacant Beds, Collections, and Pending Dues.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React |
| **Data & State** | Supabase PostgreSQL, Row Level Security (RLS), In-Memory Demo Store with LocalStorage sync |
| **Analytics** | Recharts responsive charting engine |
| **Form & Validation**| Zod, React Hook Form |
| **Testing** | Vitest unit and integration test suite |
| **Currency & Time** | INR (`₹`, paise-accurate arithmetic) & `Asia/Kolkata` timezone |

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "PG Management"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(By default, `NEXT_PUBLIC_DEMO_MODE=true` is enabled, allowing zero-friction local exploration with pre-seeded data without needing a remote database provisioned first).*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Business Rule Tests
```bash
npm test
```

---

## 🧪 Verified Business Invariants (Vitest)

StayManage includes an automated test suite verifying 7 non-negotiable SaaS business invariants:

1. **Double-Allocation Prevention**: Prevents two active residents from occupying the same bed simultaneously.
2. **Billing Idempotency**: Guarantees running monthly rent generation multiple times never creates duplicate charges for the same stay and billing month.
3. **Paise-Accurate Partial Payments**: Verified scenario (Rent ₹7,000, Paid ₹3,000 → Outstanding correctly reports ₹4,000 and status updates to `partially_paid`).
4. **Deposit Overdraft Safety**: Prohibits refund or deduction requests from exceeding the resident's active deposit balance.
5. **Checkout History Preservation**: Move-out releases the bed back to `available` without deleting historical rent charges, payments, or stay logs.
6. **Resident Data Isolation**: Restricts residents to viewing only their own room, rent dues, and maintenance tickets.
7. **Manager Property Scoping**: Restricts property managers to only explicitly assigned properties.

---

## 👥 Demo Personas & Instant Role Switching

A top banner is present throughout the application to switch between personas in one click:

| Persona | Name | Role | Scope |
|---|---|---|---|
| **Owner** | Rajesh Menon | `owner` | Multi-property organization oversight, financial KPIs, rent generation |
| **Manager** | Suresh Kumar | `manager` | Scoped strictly to Green Nest PG (Koramangala) |
| **Resident** | Rahul Sharma | `resident` | Tenant in Room 101-A, ₹4,000 pending dues, receipt download, ticket tracking |

---

## 🗄️ Database Architecture & Migrations

The complete PostgreSQL schema with Row Level Security (RLS) is located at:
`supabase/migrations/20261119000001_create_staymanage_schema.sql`

Core tables:
- `organizations`
- `profiles`
- `organization_memberships`
- `properties`
- `property_manager_assignments`
- `rooms`
- `beds`
- `residents`
- `stays` (occupancy assignments with unique partial index on `bed_id` where `status = 'active'`)
- `rent_charges` (with `UNIQUE(stay_id, billing_month)`)
- `payments`
- `payment_allocations`
- `deposit_transactions`
- `maintenance_tickets`
- `ticket_comments`
- `notifications`
- `audit_logs`

---

## 📋 Features Summary

### Completed MVP Features
- [x] Next.js 15 App Router full-stack web application
- [x] Multi-tenant role authentication & role-based routing
- [x] 5-step interactive Owner Onboarding wizard
- [x] Property, Room & Bed visual matrix with floor breakdown
- [x] Resident 360 profile, bed transfer, and checkout workflows
- [x] Idempotent monthly rent generation & partial payments
- [x] Printable & downloadable GST-compliant payment receipts
- [x] Security deposit escrow ledger with overdraft protection
- [x] Maintenance ticket Kanban/list with comment threads
- [x] Mobile-first Resident Portal
- [x] Executive dashboard with real KPI aggregates and Recharts graphs
- [x] 1-Click CSV export for Occupancy, Vacant Beds, Collections, and Dues
- [x] Vitest automated test suite passing 100%

### Features Intentionally Deferred (Post-MVP)
- Online Razorpay payment gateway integration
- Official WhatsApp Business API messaging
- AI vacancy predictive modeling
- Automatic sub-meter electricity calculation

---

## 📄 License
MIT License. Created by senior full-stack software engineer for Indian PG & hostel accommodation operators.
