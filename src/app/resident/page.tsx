"use client";

import * as React from "react";
import Link from "next/link";
import { appStore } from "@/lib/store";
import { Resident, RentCharge, Payment, MaintenanceTicket } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BedDouble,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  ArrowRight,
  QrCode,
  Smartphone,
  ShieldCheck,
  Building2,
  ChevronRight,
} from "lucide-react";

export default function ResidentDashboard() {
  const residentId = "res-001"; // Rahul Sharma persona
  const [resident, setResident] = React.useState<Resident | undefined>(() => appStore.getResident(residentId));
  const [rentCharges, setRentCharges] = React.useState<RentCharge[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);

  React.useEffect(() => {
    const update = () => {
      setResident(appStore.getResident(residentId));
      setRentCharges(appStore.getRentCharges().filter((c) => c.resident_id === residentId));
      setPayments(appStore.getPayments().filter((p) => p.resident_id === residentId));
      setTickets(appStore.getTickets().filter((t) => t.resident_id === residentId));
    };
    update();
    const unsubscribe = appStore.subscribe(update);
    return unsubscribe;
  }, []);

  const stay = resident?.current_stay;

  // Active / current month charge
  const currentCharge = rentCharges.find((c) => c.billing_month === "2026-11-01") || rentCharges[0];
  const pendingAmountPaise = currentCharge
    ? Math.max(0, currentCharge.amount_paise + currentCharge.late_fee_paise - currentCharge.amount_paid_paise)
    : 0;

  const recentPayment = payments[0];
  const openTickets = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed");

  return (
    <div className="space-y-5">
      {/* Welcome Greeting */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/15">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-white/20 text-white border-0 text-[10px] mb-2 font-medium">
              Welcome back
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">Hi, {resident?.full_name || "Rahul"}</h1>
            <p className="text-xs text-blue-100 mt-1">
              {stay?.property?.name} • Room {stay?.room?.room_number} (Bed {stay?.bed?.bed_identifier})
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
            {resident?.full_name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Primary KPI Card: Current Rent Dues */}
      <Card className="border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                November 2026 Monthly Rent
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {pendingAmountPaise === 0 ? "₹0 (Fully Cleared)" : formatINR(pendingAmountPaise)}
              </h2>
            </div>
            <Badge
              variant={
                pendingAmountPaise === 0
                  ? "success"
                  : currentCharge?.status === "partially_paid"
                  ? "warning"
                  : "destructive"
              }
              className="text-xs capitalize py-1 px-2.5"
            >
              {pendingAmountPaise === 0
                ? "Paid"
                : currentCharge?.status === "partially_paid"
                ? "Partially Paid"
                : "Due on 5th Nov"}
            </Badge>
          </div>

          <div className="pt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Monthly Rent</span>
              <strong className="text-slate-900">{formatINR(stay?.monthly_rent_paise || 700000)}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Amount Paid So Far</span>
              <strong className="text-emerald-600">{formatINR(currentCharge?.amount_paid_paise || 0)}</strong>
            </div>
          </div>

          {pendingAmountPaise > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-blue-950">
                <QrCode className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-semibold text-xs">UPI ID for Rent Transfer</p>
                  <p className="text-[11px] font-mono text-blue-800">greennest.rent@icici</p>
                </div>
              </div>
              <Link href="/resident/rent">
                <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                  Pay Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Accommodation Summary */}
        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 flex items-center">
              <BedDouble className="h-4 w-4 mr-1.5 text-blue-600" /> My Accommodation
            </span>
            <Link href="/resident/room" className="text-xs text-blue-600 font-medium hover:underline flex items-center">
              Room Details <ChevronRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">
                  Room {stay?.room?.room_number} — Bed {stay?.bed?.bed_identifier}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">{stay?.room?.room_type} Sharing</p>
              </div>
              <Badge variant="default" className="text-[10px]">Active</Badge>
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              Check-in Date: <strong className="text-slate-800">{formatDate(stay?.check_in_date)}</strong>
            </p>
            <p className="text-[11px] text-slate-500">
              Security Deposit Held: <strong className="text-slate-800">{formatINR(stay?.security_deposit_paise || 0)}</strong>
            </p>
          </div>
        </Card>

        {/* Complaints Status */}
        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900 flex items-center">
              <Wrench className="h-4 w-4 mr-1.5 text-rose-600" /> Maintenance Complaints
            </span>
            <Link href="/resident/complaints" className="text-xs text-blue-600 font-medium hover:underline flex items-center">
              Raise Ticket <ChevronRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>

          {openTickets.length === 0 ? (
            <div className="p-4 rounded-lg bg-emerald-50 text-center space-y-1">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold text-emerald-950">No Open Complaints</p>
              <p className="text-[11px] text-emerald-800">Everything in your room is functioning smoothly.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openTickets.map((t) => (
                <div key={t.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-900 truncate">{t.title}</span>
                    <Badge variant="warning" className="text-[9px] capitalize py-0 px-1">
                      {t.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {t.comments && t.comments.length > 0 && (
                    <p className="text-[11px] text-blue-700 bg-blue-50/70 p-1.5 rounded mt-1">
                      Manager: {t.comments[t.comments.length - 1].comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Payment & Tax Receipt */}
      {recentPayment && (
        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" /> Recent Payment Receipt
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                {recentPayment.receipt_number} • {formatDate(recentPayment.payment_date)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-emerald-600 text-sm">+{formatINR(recentPayment.amount_paise)}</p>
              <Link href="/resident/rent" className="text-[11px] text-blue-600 hover:underline">
                Download PDF Receipt →
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
