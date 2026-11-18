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
| **Database & ORM** | MongoDB (Local `mongodb://127.0.0.1:27017/staymanage`), Mongoose 8 with strict index constraints |
| **Data & State** | MongoDB REST APIs + Client Reactive Store with LocalStorage synchronization |
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
Configure your MongoDB connection string (default configured for local MongoDB):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/staymanage
```

### 3. Seed MongoDB with Realistic PG Mock Data
Run the automated seed command to populate your local MongoDB with 3 properties, 17 rooms, 34 beds, 24 residents, billing charges, payments, deposits, and tickets:
```bash
npm run seed:mongo
```
*(You can also re-seed anytime directly from the UI via the "Seed MongoDB" button in the top banner or Organization Settings).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Business Rule Tests
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

## 🗄️ Database Architecture & Schemas

### MongoDB Primary Data Store (`src/lib/mongodb/`)
StayManage connects directly to local MongoDB (`mongodb://127.0.0.1:27017/staymanage`) using Mongoose models (`src/lib/mongodb/models.ts`):
- `OrganizationModel`: Multi-property parent business account with GSTIN and billing policies.
- `ProfileModel`: User authentication and role association (`owner`, `manager`, `resident`).
- `PropertyModel`: Multi-building records (floors, rules, location, contact numbers).
- `RoomModel`: Room records with floor numbers, sharing configurations, and base rent.
- `BedModel`: Individual beds (`101-A`, `101-B`) with operational status.
- `ResidentModel`: Indian PG residents with contact info, emergency contacts, and permanent address.
- `StayModel`: Occupancy allocations with **strict single-occupancy constraint**:
  ```ts
  StaySchema.index({ bed_id: 1 }, { unique: true, partialFilterExpression: { status: "active" } });
  ```
- `RentChargeModel`: Monthly rent records with **idempotency constraint**:
  ```ts
  RentChargeSchema.index({ stay_id: 1, billing_month: 1 }, { unique: true });
  ```
- `PaymentModel`: Manual payments with receipt numbers, UPI references, and allocation.
- `DepositTransactionModel`: Escrow ledger for deposit collections, deductions, and checkout refunds.
- `MaintenanceTicketModel`: Complaints with priority ratings, categories, and resolution logs.
- `NotificationModel`: System alerts and action notices.

### MongoDB REST APIs (`src/app/api/`)
- `GET /api/mongodb/status`: Returns MongoDB connection status, database name, and live collection document counts.
- `POST /api/mongodb/seed`: Triggers automated database re-seeding with realistic Indian PG mock records.
- `GET, POST /api/properties`: Multi-property management.
- `GET, POST /api/rooms`: Room creation with automatic sub-bed letter generation.
- `GET, POST /api/residents`: Resident registration with bed allocation and deposit recording.
- `GET, PUT /api/residents/[id]`: Resident 360 profile and contact info editing.
- `POST /api/residents/transfer`: Bed transfer with target occupancy verification.
- `POST /api/residents/checkout`: Move-out with deposit deductions, refunds, and bed release.
- `POST /api/rent/generate`: Idempotent monthly rent charge generation.
- `POST /api/rent/payments`: Manual payment recording with automatic status transitions.
- `GET, POST /api/deposits`: Security deposit ledger transactions.
- `GET, POST /api/maintenance`: Complaint submission and ticket list.
- `PATCH /api/maintenance/[id]`: Status updates and staff comment threads.

*(For legacy reference, the original PostgreSQL schema with Row Level Security is preserved in `supabase/migrations/`).*

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
