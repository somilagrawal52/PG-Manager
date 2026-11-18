"use client";

import Link from "next/link";
import {
  Building2,
  BedDouble,
  Receipt,
  ShieldCheck,
  Wrench,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  Smartphone,
  CreditCard,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              SM
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">StayManage</span>
              <span className="ml-1.5 inline-block text-[10px] font-semibold tracking-wider uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                SaaS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#solutions" className="hover:text-blue-600 transition-colors">
              For PG Owners
            </a>
            <a href="#resident-portal" className="hover:text-blue-600 transition-colors">
              Resident Portal
            </a>
            <a href="#security" className="hover:text-blue-600 transition-colors">
              Security
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/30">
                Launch Live Demo <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-medium mb-6 animate-in fade-in">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Built exclusively for Indian PGs, Hostels & Co-living Spaces</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            The Centralized Operating System for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Modern PG & Hostel Management
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Replace scattered Excel sheets, paper registers, and manual WhatsApp follow-ups.
            Manage rooms, bed occupancy, rent collection, security deposit ledgers, and maintenance
            tickets from one dashboard.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-7 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25">
                Explore Demo Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="outline" size="lg" className="h-12 px-6 text-base border-slate-300">
                Start Owner Setup
              </Button>
            </Link>
            <Link href="/resident">
              <Button variant="secondary" size="lg" className="h-12 px-6 text-base bg-slate-100 hover:bg-slate-200 text-slate-800">
                <Smartphone className="mr-2 h-4 w-4 text-blue-600" />
                Resident App
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-100">
            <div className="p-3 text-center border-r border-slate-100 last:border-0">
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-500 mt-0.5">Zero Double Bookings</p>
            </div>
            <div className="p-3 text-center border-r border-slate-100 last:border-0">
              <p className="text-2xl font-bold text-slate-900">₹ Exact</p>
              <p className="text-xs text-slate-500 mt-0.5">Paise-Accurate Accounting</p>
            </div>
            <div className="p-3 text-center border-r border-slate-100 last:border-0">
              <p className="text-2xl font-bold text-slate-900">1-Click</p>
              <p className="text-xs text-slate-500 mt-0.5">Monthly Rent Invoicing</p>
            </div>
            <div className="p-3 text-center">
              <p className="text-2xl font-bold text-slate-900">3-Way</p>
              <p className="text-xs text-slate-500 mt-0.5">Owner, Manager & Tenant RBAC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="default" className="mb-3">
              Comprehensive Feature Suite
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Designed specifically for how Indian PGs operate
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              From biometric-ready room assignments to UPI receipt tracking, every detail is crafted
              to simplify accommodation management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. Room & Bed Management */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-11 w-11 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                <BedDouble className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Visual Room & Bed Matrix</h3>
              <p className="text-sm text-slate-600 mt-2">
                Floor-wise matrix view showing single, double, and triple-sharing rooms. Real-time
                availability indicators prevent conflicting bed assignments.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Unique Bed IDs (e.g. 101-A, 101-B)</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Database-level occupancy locking</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Floor & amenity filtering</li>
              </ul>
            </div>

            {/* 2. Rent & Payments */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-11 w-11 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Rent & UPI Payments</h3>
              <p className="text-sm text-slate-600 mt-2">
                Idempotent monthly rent generation. Record partial payments with exact outstanding
                calculation and instant downloadable GST-ready PDF receipts.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> UPI, Cash & Bank Transfer logs</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Automated overdue flags & late fees</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Zero duplicate billing guarantee</li>
              </ul>
            </div>

            {/* 3. Security Deposit Escrow */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-11 w-11 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Security Deposit Escrow</h3>
              <p className="text-sm text-slate-600 mt-2">
                Completely isolated security deposit ledger separate from monthly rent. Record
                damage deductions and settled refunds during move-out without balance overdrafts.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Overdraft safety checks</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Seamless move-out settlement</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Audit trail for all adjustments</li>
              </ul>
            </div>

            {/* 4. Resident Lifecycle */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-11 w-11 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Resident 360 & Move-out</h3>
              <p className="text-sm text-slate-600 mt-2">
                Emergency contacts, ID proofs, check-in dates, bed transfers, and notice period
                tracking. Bed is automatically freed upon checkout while preserving payment records.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> 1-Click bed transfer workflow</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Notice period tracking</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Historical stay records</li>
              </ul>
            </div>

            {/* 5. Maintenance Tickets */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-11 w-11 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Maintenance & Complaints</h3>
              <p className="text-sm text-slate-600 mt-2">
                Residents raise tickets for plumbing, electrical, Wi-Fi, or cleaning issues. Owners and
                managers assign staff, post progress updates, and log resolution dates.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Category & priority routing</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Resident-manager comment thread</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> SLA & resolution tracking</li>
              </ul>
            </div>

            {/* 6. Reports & Analytics */}
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="h-11 w-11 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-5">
                <BarChart3 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Reports & CSV Exports</h3>
              <p className="text-sm text-slate-600 mt-2">
                Executive dashboard with real database aggregates. Export current occupancy, vacant
                beds, monthly rent collection, and pending dues directly to Excel-friendly CSV.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Occupancy & revenue charts</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Filter by property & date range</li>
                <li className="flex items-center"><CheckCircle className="h-3.5 w-3.5 text-emerald-600 mr-2 shrink-0" /> Instant 1-click CSV download</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Resident Portal Highlight */}
      <section id="resident-portal" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <Badge variant="purple" className="mb-3">
                Mobile-First Self-Service
              </Badge>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
                A dedicated, private portal for every resident
              </h2>
              <p className="mt-4 text-slate-600 text-base leading-relaxed">
                Residents get a frictionless smartphone experience to check their current dues, download
                payment receipts for tax/HRA claims, raise maintenance requests, and review property rules.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start">
                  <div className="p-1 rounded-full bg-blue-100 text-blue-600 mr-3 mt-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Zero Uncomfortable Follow-ups</h4>
                    <p className="text-xs text-slate-500">Tenants see exact due dates, bank transfer/UPI details, and payment history.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-1 rounded-full bg-blue-100 text-blue-600 mr-3 mt-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">HRA Tax Receipts On Demand</h4>
                    <p className="text-xs text-slate-500">Download formatted rent payment receipts anytime without calling the owner.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-1 rounded-full bg-blue-100 text-blue-600 mr-3 mt-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Real-time Complaint Tracking</h4>
                    <p className="text-xs text-slate-500">Know when the electrician or plumber is scheduled with transparent manager comments.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link href="/resident">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                    <Smartphone className="mr-2 h-4 w-4" /> View Resident Portal Demo
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-10 lg:mt-0 p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white shadow-2xl border border-slate-700">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs font-mono text-slate-400">resident.staymanage.in</span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Assigned Bed</span>
                    <span className="text-emerald-400 font-medium">Green Nest PG</span>
                  </div>
                  <p className="text-xl font-bold mt-1">Room 101 — Bed 101-A</p>
                  <p className="text-xs text-slate-400 mt-1">Double Sharing (Attached Washroom & Balcony)</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-900/30 border border-blue-700/50 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-blue-300">November 2026 Rent Outstanding</p>
                    <p className="text-2xl font-bold text-white mt-0.5">₹4,000</p>
                    <p className="text-[11px] text-blue-200 mt-0.5">₹3,000 paid on 4th Nov (Receipt #RCP-202611-0001)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
                    Partially Paid
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Active Complaints</span>
                    <span className="text-xs text-blue-400 font-medium">1 In Progress</span>
                  </div>
                  <p className="text-sm font-medium mt-1">Ceiling fan clicking noise</p>
                  <p className="text-xs text-slate-400 mt-0.5">Manager note: Electrician scheduled today by 4 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              SM
            </div>
            <span className="text-white font-bold text-base">StayManage</span>
            <span className="text-xs text-slate-500">| Smart PG & Hostel Management SaaS</span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Owner Dashboard
            </Link>
            <Link href="/resident" className="hover:text-white transition-colors">
              Resident Portal
            </Link>
            <Link href="/onboarding" className="hover:text-white transition-colors">
              Onboarding Wizard
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Role Switcher
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 StayManage. Designed for Indian Accommodation Operators.
          </p>
        </div>
      </footer>
    </div>
  );
}
