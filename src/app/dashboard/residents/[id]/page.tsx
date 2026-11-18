"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { appStore } from "@/lib/store";
import { Resident, RentCharge, Payment, DepositTransaction, Bed } from "@/lib/types";
import { formatINR, formatDate, calculateDepositBalance } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Users,
  Phone,
  Mail,
  MapPin,
  BedDouble,
  Receipt,
  CreditCard,
  ShieldCheck,
  ArrowRightLeft,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ResidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const residentId = params.id as string;

  const [resident, setResident] = React.useState<Resident | undefined>(() => appStore.getResident(residentId));
  const [rentCharges, setRentCharges] = React.useState<RentCharge[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [depositTx, setDepositTx] = React.useState<DepositTransaction[]>([]);
  const [availableBeds, setAvailableBeds] = React.useState<Bed[]>([]);

  // Transfer Bed Modal
  const [isTransferOpen, setIsTransferOpen] = React.useState(false);
  const [targetBedId, setTargetBedId] = React.useState("");

  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [checkOutDate, setCheckOutDate] = React.useState(() => new Date().toISOString().split("T")[0]);
  const [deductionRupees, setDeductionRupees] = React.useState(0);
  const [deductionReason, setDeductionReason] = React.useState("Deep cleaning & wall paint touch-up");
  const [refundRupees, setRefundRupees] = React.useState(0);
  const [refundMethod, setRefundMethod] = React.useState<"upi" | "bank_transfer" | "cash">("upi");

  // Edit Resident Modal
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editEmergencyName, setEditEmergencyName] = React.useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = React.useState("");
  const [editAddress, setEditAddress] = React.useState("");
  const [editNotes, setEditNotes] = React.useState("");

  const loadData = React.useCallback(() => {
    const res = appStore.getResident(residentId);
    setResident(res);
    setRentCharges(appStore.getRentCharges().filter((c) => c.resident_id === residentId));
    setPayments(appStore.getPayments().filter((p) => p.resident_id === residentId));
    setDepositTx(appStore.getDepositTransactions(residentId));

    if (res) {
      setEditName(res.full_name);
      setEditPhone(res.phone);
      setEditEmail(res.email || "");
      setEditEmergencyName(res.emergency_contact_name || "");
      setEditEmergencyPhone(res.emergency_contact_phone || "");
      setEditAddress(res.permanent_address || "");
      setEditNotes(res.notes || "");
    }

    const vacantBeds = appStore.getBeds().filter((b) => b.status === "available");
    setAvailableBeds(vacantBeds);
    if (vacantBeds.length > 0 && !targetBedId) {
      setTargetBedId(vacantBeds[0].id);
    }
  }, [residentId, targetBedId]);

  React.useEffect(() => {
    loadData();
    const unsubscribe = appStore.subscribe(loadData);
    return unsubscribe;
  }, [loadData]);

  if (!resident) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">Resident record not found.</p>
        <Link href="/dashboard/residents">
          <Button size="sm" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Residents
          </Button>
        </Link>
      </div>
    );
  }

  const depositSummary = calculateDepositBalance(depositTx);
  const currentStay = resident.current_stay;

  // Calculate outstanding rent
  const totalOutstandingPaise = rentCharges.reduce((acc, c) => {
    const totalDue = c.amount_paise + c.late_fee_paise;
    return acc + Math.max(0, totalDue - c.amount_paid_paise);
  }, 0);

  // Auto-fill suggested refund when opening checkout modal
  const openCheckoutModal = () => {
    const available = depositSummary.balance;
    const initialDeduction = 0;
    const initialRefund = Math.max(0, Math.round(available / 100));
    setDeductionRupees(initialDeduction);
    setRefundRupees(initialRefund);
    setIsCheckoutOpen(true);
  };

  const handleBedTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      appStore.transferBed(resident.id, targetBedId);
      const newBed = appStore.getBeds().find((b) => b.id === targetBedId);
      toast({
        title: "Bed Transfer Completed",
        description: `${resident.full_name} moved to Bed ${newBed?.bed_identifier}. Old bed released.`,
        type: "success",
      });
      setIsTransferOpen(false);
    } catch (err: any) {
      toast({ title: "Transfer Failed", description: err.message, type: "error" });
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      appStore.checkoutResident({
        residentId: resident.id,
        checkOutDate,
        deductionPaise: Number(deductionRupees) * 100,
        deductionReason: deductionRupees > 0 ? deductionReason : undefined,
        refundPaise: Number(refundRupees) * 100,
        refundMethod,
      });

      toast({
        title: "Resident Checked Out Successfully",
        description: `Bed has been released to available. Deposit settled. History preserved.`,
        type: "success",
      });

      setIsCheckoutOpen(false);
    } catch (err: any) {
      toast({ title: "Checkout Error", description: err.message, type: "error" });
    }
  };

  const handleSaveResident = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      appStore.updateResident(resident.id, {
        full_name: editName,
        phone: editPhone,
        email: editEmail || undefined,
        emergency_contact_name: editEmergencyName || undefined,
        emergency_contact_phone: editEmergencyPhone || undefined,
        permanent_address: editAddress || undefined,
        notes: editNotes || undefined,
      });

      toast({
        title: "Resident Details Updated",
        description: `Profile for ${editName} saved successfully.`,
        type: "success",
      });
      setIsEditOpen(false);
    } catch (err: any) {
      toast({ title: "Failed to update resident", description: err.message, type: "error" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/residents">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> All Residents
            </Button>
          </Link>
          <Badge
            variant={
              resident.status === "active"
                ? "success"
                : resident.status === "notice"
                ? "warning"
                : "secondary"
            }
            className="capitalize text-xs"
          >
            {resident.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="text-xs h-8"
          >
            Edit Profile
          </Button>
          {resident.status === "active" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTransferOpen(true)}
                className="text-xs h-8"
              >
                <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" /> Transfer Bed
              </Button>
              <Button
                size="sm"
                onClick={openCheckoutModal}
                className="bg-rose-600 hover:bg-rose-700 text-xs h-8 text-white shadow-xs"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Initiate Move-out / Checkout
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Resident Profile Card */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 shrink-0">
              {resident.full_name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">{resident.full_name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" /> {resident.phone}
                </span>
                {resident.email && (
                  <span className="flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1 text-slate-400" /> {resident.email}
                  </span>
                )}
              </div>
              {resident.permanent_address && (
                <p className="text-xs text-slate-500 flex items-center pt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
                  {resident.permanent_address}
                </p>
              )}
            </div>
          </div>

          {/* Current Stay & Bed Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 min-w-[240px]">
            <p className="font-semibold text-slate-800 flex items-center">
              <BedDouble className="h-4 w-4 mr-1.5 text-blue-600" /> Current Accommodation
            </p>
            {currentStay ? (
              <>
                <p className="text-slate-600">
                  Property: <strong className="text-slate-900">{currentStay.property?.name}</strong>
                </p>
                <p className="text-slate-600">
                  Room & Bed: <strong className="text-slate-900">Room {currentStay.room?.room_number} ({currentStay.bed?.bed_identifier})</strong>
                </p>
                <p className="text-slate-600">
                  Check-in Date: <strong className="text-slate-900">{formatDate(currentStay.check_in_date)}</strong>
                </p>
                <p className="text-slate-600">
                  Monthly Rent: <strong className="text-slate-900">{formatINR(currentStay.monthly_rent_paise)}</strong>
                </p>
              </>
            ) : (
              <p className="text-slate-400">No active stay allocation.</p>
            )}
          </div>
        </div>

        {resident.emergency_contact_name && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap gap-4">
            <span>
              Emergency Contact: <strong className="text-slate-900">{resident.emergency_contact_name}</strong>
            </span>
            <span>
              Emergency Phone: <strong className="text-slate-900">{resident.emergency_contact_phone}</strong>
            </span>
            {resident.notes && (
              <span className="text-slate-500 italic">Note: {resident.notes}</span>
            )}
          </div>
        )}
      </Card>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Outstanding Rent */}
        <Card className="p-4 bg-white border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Outstanding Rent Dues</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatINR(totalOutstandingPaise)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across unbilled & partial months</p>
        </Card>

        {/* Security Deposit Held */}
        <Card className="p-4 bg-white border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Security Deposit Balance</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatINR(depositSummary.balance)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Collected: {formatINR(depositSummary.collected)} • Deducted: {formatINR(depositSummary.deductions)}
          </p>
        </Card>

        {/* Total Payments Made */}
        <Card className="p-4 bg-white border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Rent Paid to Date</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatINR(payments.reduce((acc, p) => acc + p.amount_paise, 0))}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{payments.length} verified receipts issued</p>
        </Card>
      </div>

      {/* Rent Charges Table */}
      <Card className="overflow-hidden bg-white border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">Monthly Rent Invoices</CardTitle>
            <CardDescription>Billing charges generated for this resident</CardDescription>
          </div>
          <Link href="/dashboard/payments">
            <Button size="sm" variant="outline" className="text-xs h-7">
              <CreditCard className="mr-1 h-3 w-3" /> Record Payment
            </Button>
          </Link>
        </CardHeader>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-4">Billing Month</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4">Amount Due</th>
                <th className="py-2.5 px-4">Amount Paid</th>
                <th className="py-2.5 px-4">Outstanding</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentCharges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No rent charges generated yet.
                  </td>
                </tr>
              ) : (
                rentCharges.map((charge) => {
                  const total = charge.amount_paise + charge.late_fee_paise;
                  const pending = Math.max(0, total - charge.amount_paid_paise);
                  return (
                    <tr key={charge.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{charge.billing_month}</td>
                      <td className="py-2.5 px-4 text-slate-600">{formatDate(charge.due_date)}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{formatINR(total)}</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-semibold">{formatINR(charge.amount_paid_paise)}</td>
                      <td className="py-2.5 px-4 font-bold text-amber-600">{formatINR(pending)}</td>
                      <td className="py-2.5 px-4">
                        <Badge
                          variant={
                            charge.status === "paid"
                              ? "success"
                              : charge.status === "partially_paid"
                              ? "warning"
                              : "destructive"
                          }
                          className="capitalize text-[10px]"
                        >
                          {charge.status.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Security Deposit Ledger Table */}
      <Card className="overflow-hidden bg-white border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold">Security Deposit Escrow Ledger</CardTitle>
          <CardDescription>Immutable record of deposits collected, deductions, and refunds</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Transaction Type</th>
                <th className="py-2.5 px-4">Amount</th>
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {depositTx.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No deposit transactions recorded.
                  </td>
                </tr>
              ) : (
                depositTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-slate-600">{formatDate(tx.transaction_date)}</td>
                    <td className="py-2.5 px-4">
                      <Badge
                        variant={
                          tx.transaction_type === "collected"
                            ? "default"
                            : tx.transaction_type === "deduction"
                            ? "destructive"
                            : "secondary"
                        }
                        className="uppercase text-[10px]"
                      >
                        {tx.transaction_type}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {tx.transaction_type === "collected" ? "+" : "-"}
                      {formatINR(tx.amount_paise)}
                    </td>
                    <td className="py-2.5 px-4 uppercase text-[10px] text-slate-500">{tx.payment_method}</td>
                    <td className="py-2.5 px-4 text-slate-600">{tx.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transfer Bed Modal */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Bed</DialogTitle>
            <DialogDescription>
              Move {resident.full_name} to another vacant bed. Current bed will be released.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBedTransfer} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select New Vacant Bed</label>
              {availableBeds.length === 0 ? (
                <p className="text-red-600 text-xs">No available beds found for transfer.</p>
              ) : (
                <select
                  value={targetBedId}
                  onChange={(e) => setTargetBedId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium"
                  required
                >
                  {availableBeds.map((b) => (
                    <option key={b.id} value={b.id}>
                      Room {b.room?.room_number} (Bed {b.bed_identifier}) • Rent: ₹
                      {Math.round((b.room?.base_rent_paise || 600000) / 100)}/mo
                    </option>
                  ))}
                </select>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={availableBeds.length === 0}>
                Confirm Transfer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Checkout / Move-out Settlement Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Resident Move-Out & Deposit Settlement</DialogTitle>
            <DialogDescription>
              Complete checkout for {resident.full_name}. This releases bed {currentStay?.bed?.bed_identifier} while preserving historical accounts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCheckout} className="space-y-4 text-xs">
            {/* Rent Dues Alert */}
            {totalOutstandingPaise > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs">
                    Pending Rent Dues: {formatINR(totalOutstandingPaise)}
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Advise deducting pending rent from the security deposit or collect payment before releasing deposit.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Actual Checkout Date</label>
                <Input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Available Deposit Balance</label>
                <div className="h-9 px-3 py-2 bg-slate-100 rounded-lg font-bold text-slate-900 flex items-center">
                  {formatINR(depositSummary.balance)}
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-semibold text-slate-900">Deductions (Damages, Painting, Rent Dues)</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[11px] text-slate-500 mb-1">Amount (₹)</label>
                  <Input
                    type="number"
                    min={0}
                    value={deductionRupees}
                    onChange={(e) => setDeductionRupees(Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-500 mb-1">Reason for Deduction</label>
                  <Input
                    value={deductionReason}
                    onChange={(e) => setDeductionReason(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Refund to Resident */}
            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <p className="font-semibold text-emerald-950">Refund to Resident</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Refund Amount (₹)</label>
                  <Input
                    type="number"
                    min={0}
                    value={refundRupees}
                    onChange={(e) => setRefundRupees(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Refund Payment Method</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="cash">Cash in Hand</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              Total Settlement:{" "}
              <strong>₹{deductionRupees + refundRupees}</strong> / Available:{" "}
              <strong>{formatINR(depositSummary.balance)}</strong>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCheckoutOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                Confirm Checkout & Free Bed
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Resident Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Resident Details</DialogTitle>
            <DialogDescription>
              Update contact information, emergency contacts, and notes
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveResident} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Emergency Contact Person</label>
                <Input value={editEmergencyName} onChange={(e) => setEditEmergencyName(e.target.value)} />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Emergency Phone</label>
                <Input value={editEmergencyPhone} onChange={(e) => setEditEmergencyPhone(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Permanent Home Address</label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Notes / Preferences</label>
              <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                Save Details
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
