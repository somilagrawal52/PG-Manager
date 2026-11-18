"use client";

import * as React from "react";
import Link from "next/link";
import { appStore } from "@/lib/store";
import { DashboardStats, RentCharge, Payment, MaintenanceTicket, Stay } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  BedDouble,
  Users,
  Receipt,
  AlertTriangle,
  Wrench,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats>(() => appStore.getDashboardStats());
  const [rentCharges, setRentCharges] = React.useState<RentCharge[]>(() => appStore.getRentCharges());
  const [payments, setPayments] = React.useState<Payment[]>(() => appStore.getPayments());
  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>(() => appStore.getTickets());
  const [stays, setStays] = React.useState<Stay[]>(() => appStore.getState().stays);

  React.useEffect(() => {
    const update = () => {
      setStats(appStore.getDashboardStats());
      setRentCharges(appStore.getRentCharges());
      setPayments(appStore.getPayments());
      setTickets(appStore.getTickets());
      setStays(appStore.getState().stays);
    };
    const unsubscribe = appStore.subscribe(update);
    return unsubscribe;
  }, []);

  // Prepare Chart Data
  // 1. Revenue Trends (Past 4 months)
  const collectionTrendData = [
    { month: "Aug", collected: 135000, target: 150000 },
    { month: "Sep", collected: 142000, target: 150000 },
    { month: "Oct", collected: 148500, target: 155000 },
    { month: "Nov", collected: Math.round(stats.rentCollectedThisMonthPaise / 100), target: 160000 },
  ];

  // 2. Paid vs Outstanding Pie
  const rentDistributionData = [
    { name: "Collected", value: Math.round(stats.rentCollectedThisMonthPaise / 100), color: "#10b981" },
    { name: "Outstanding", value: Math.round(stats.rentOutstandingPaise / 100), color: "#f59e0b" },
  ];

  // 3. Property Occupancy comparison
  const propertyOccupancyData = [
    { name: "Green Nest PG", occupied: 13, available: 3 },
    { name: "Urban Stay", occupied: 6, available: 4 },
  ];

  // Overdue rent list
  const overdueCharges = rentCharges.filter((c) => c.status === "overdue" || (c.status === "partially_paid" && c.amount_paid_paise < c.amount_paise));

  // Upcoming move-outs
  const upcomingMoveOuts = stays.filter((s) => s.expected_check_out_date && s.status === "active");

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy, revenue performance, and operations for Indian properties
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/rent">
            <Button size="sm" variant="outline" className="text-xs h-8">
              <Receipt className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> Generate Nov Rent
            </Button>
          </Link>
          <Link href="/dashboard/residents">
            <Button size="sm" className="text-xs h-8 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5 mr-1" /> Onboard Resident
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row 1: Occupancy & Beds */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Properties */}
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Properties</span>
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalProperties}</div>
          <p className="text-[11px] text-slate-500 mt-1">{stats.totalRooms} Rooms Total</p>
        </Card>

        {/* Total Beds */}
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Beds</span>
            <BedDouble className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalBeds}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across 2 Buildings</p>
        </Card>

        {/* Occupancy Rate */}
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Occupancy</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.occupancyRate}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </Card>

        {/* Occupied vs Available Beds */}
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Residents</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.occupiedBeds}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {stats.availableBeds} Beds Vacant
          </p>
        </Card>

        {/* Open Complaints */}
        <Card className="p-4 bg-white col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Open Tickets</span>
            <Wrench className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.openTicketsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Avg SLA: &lt; 24 hrs</p>
        </Card>
      </div>

      {/* KPI Cards Row 2: Financial Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Rent Collected This Month */}
        <Card className="p-5 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50/40 via-white to-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                November 2026 Collections
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                {formatINR(stats.rentCollectedThisMonthPaise)}
              </h3>
              <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {payments.length} verified manual payments logged
              </p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Outstanding Rent */}
        <Card className="p-5 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/40 via-white to-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Rent Dues
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
                {formatINR(stats.rentOutstandingPaise)}
              </h3>
              <p className="text-xs text-amber-700 font-medium mt-1 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" /> Includes partial & upcoming balances
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </Card>

        {/* Overdue Accounts */}
        <Card className="p-5 border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50/40 via-white to-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overdue Accounts
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
                {stats.overdueRentCount} Accounts
              </h3>
              <p className="text-xs text-rose-700 font-medium mt-1 flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Past 5th November grace period
              </p>
            </div>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold">Rent Collection Trend (INR)</CardTitle>
              <CardDescription>Actual monthly collections vs revenue target</CardDescription>
            </div>
            <Badge variant="outline">2026 Fiscal</Badge>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collectionTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Amount"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="collected" name="Collected (₹)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target (₹)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Paid vs Outstanding Ratio */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Collection Realization</CardTitle>
            <CardDescription>Paid vs Outstanding for November 2026</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={rentDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {rentDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `₹${val.toLocaleString("en-IN")}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 text-xs font-medium text-slate-600">
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" /> Paid (
                {Math.round(
                  (stats.rentCollectedThisMonthPaise /
                    (stats.rentCollectedThisMonthPaise + stats.rentOutstandingPaise || 1)) *
                    100
                )}
                %)
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-1.5" /> Pending (
                {Math.round(
                  (stats.rentOutstandingPaise /
                    (stats.rentCollectedThisMonthPaise + stats.rentOutstandingPaise || 1)) *
                    100
                )}
                %)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Grids Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Accounts & Partial Balances */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold">Pending Dues & Overdue Accounts</CardTitle>
              <CardDescription>Residents with outstanding balances for this billing period</CardDescription>
            </div>
            <Link href="/dashboard/rent" className="text-xs text-blue-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {overdueCharges.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No overdue accounts.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {overdueCharges.slice(0, 5).map((charge) => {
                  const pendingPaise = charge.amount_paise + charge.late_fee_paise - charge.amount_paid_paise;
                  return (
                    <div key={charge.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{charge.resident?.full_name}</p>
                        <p className="text-[11px] text-slate-500">
                          {charge.property?.name} • Due: {formatDate(charge.due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-rose-600">{formatINR(pendingPaise)}</p>
                        <Badge
                          variant={charge.status === "overdue" ? "destructive" : "warning"}
                          className="text-[10px] py-0 px-1.5 mt-0.5"
                        >
                          {charge.status === "overdue" ? "Overdue" : "Partially Paid"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments Received */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold">Recent Payment Transactions</CardTitle>
              <CardDescription>Manual UPI, Cash, and Bank Transfer receipts</CardDescription>
            </div>
            <Link href="/dashboard/payments" className="text-xs text-blue-600 hover:underline">
              View Ledger
            </Link>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No payment transactions recorded.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {payments.slice(0, 5).map((pay) => (
                  <div key={pay.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{pay.resident?.full_name || "Resident"}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {pay.receipt_number} • {formatDate(pay.payment_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">+{formatINR(pay.amount_paise)}</p>
                      <Badge variant="secondary" className="uppercase text-[9px] py-0 px-1 mt-0.5">
                        {pay.payment_method}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Maintenance Complaints & Upcoming Move-Outs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Complaints */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold">Maintenance & Service Requests</CardTitle>
              <CardDescription>Real-time tickets submitted by residents</CardDescription>
            </div>
            <Link href="/dashboard/maintenance" className="text-xs text-blue-600 hover:underline">
              Open Board
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 text-xs">
              {tickets.slice(0, 4).map((ticket) => (
                <div key={ticket.id} className="py-2.5 flex items-start justify-between">
                  <div className="space-y-0.5 max-w-sm">
                    <p className="font-semibold text-slate-900 truncate">{ticket.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {ticket.resident?.full_name} • {ticket.property?.name} • {ticket.category}
                    </p>
                  </div>
                  <Badge
                    variant={
                      ticket.status === "open"
                        ? "destructive"
                        : ticket.status === "in_progress"
                        ? "warning"
                        : "success"
                    }
                    className="capitalize text-[10px]"
                  >
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Move-outs and Notices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-semibold">Upcoming Move-Outs & Notice Periods</CardTitle>
              <CardDescription>Residents planning to vacate within 30 days</CardDescription>
            </div>
            <Link href="/dashboard/residents" className="text-xs text-blue-600 hover:underline">
              Resident Directory
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingMoveOuts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No move-outs scheduled.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {upcomingMoveOuts.map((stay) => {
                  const res = appStore.getResident(stay.resident_id);
                  return (
                    <div key={stay.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{res?.full_name}</p>
                        <p className="text-[11px] text-slate-500">
                          Expected vacate date: {formatDate(stay.expected_check_out_date)}
                        </p>
                      </div>
                      <Link href={`/dashboard/residents/${res?.id}`}>
                        <Button size="sm" variant="outline" className="text-[11px] h-7">
                          Review Settlement
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
