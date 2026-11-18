"use client";

import * as React from "react";
import Link from "next/link";
import { appStore } from "@/lib/store";
import { RentCharge, Property, RentStatus } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Receipt, Calendar, Plus, Filter, Search, CheckCircle2, Clock, AlertTriangle, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function RentManagementPage() {
  const { toast } = useToast();

  const [rentCharges, setRentCharges] = React.useState<RentCharge[]>([]);
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Generate Rent Modal
  const [isGenerateOpen, setIsGenerateOpen] = React.useState(false);
  const [billingMonth, setBillingMonth] = React.useState("2026-11-01");
  const [dueDate, setDueDate] = React.useState("2026-11-05");

  // Record Payment Modal from this page
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [selectedChargeForPay, setSelectedChargeForPay] = React.useState<RentCharge | null>(null);
  const [payAmountRupees, setPayAmountRupees] = React.useState(0);
  const [payMethod, setPayMethod] = React.useState<"upi" | "cash" | "bank_transfer">("upi");
  const [payReference, setPayReference] = React.useState("");

  const loadData = React.useCallback(() => {
    setProperties(appStore.getProperties());
    const propFilter = selectedPropertyId === "all" ? undefined : selectedPropertyId;
    setRentCharges(appStore.getRentCharges(propFilter));
  }, [selectedPropertyId]);

  React.useEffect(() => {
    loadData();
    const unsubscribe = appStore.subscribe(loadData);
    return unsubscribe;
  }, [loadData]);

  const handleGenerateRent = (e: React.FormEvent) => {
    e.preventDefault();
    const result = appStore.generateMonthlyRentCharges(billingMonth, dueDate);
    toast({
      title: "Rent Generation Executed",
      description: `Generated ${result.generated} charges. Skipped ${result.skipped} to prevent duplicates (Idempotent).`,
      type: "success",
    });
    setIsGenerateOpen(false);
  };

  const openPaymentForCharge = (charge: RentCharge) => {
    const totalDue = charge.amount_paise + charge.late_fee_paise;
    const pendingPaise = Math.max(0, totalDue - charge.amount_paid_paise);
    setSelectedChargeForPay(charge);
    setPayAmountRupees(Math.round(pendingPaise / 100));
    setPayReference(`UPI/GPay/${Math.floor(1000000 + Math.random() * 9000000)}`);
    setIsPaymentOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChargeForPay) return;

    try {
      const payment = appStore.recordPayment({
        resident_id: selectedChargeForPay.resident_id,
        rent_charge_id: selectedChargeForPay.id,
        amount_paise: Number(payAmountRupees) * 100,
        payment_method: payMethod,
        payment_date: new Date().toISOString().split("T")[0],
        reference_number: payReference,
        notes: `Payment for ${selectedChargeForPay.billing_month || "month"} via ${payMethod.toUpperCase()}`,
      });

      toast({
        title: "Payment Recorded & Allocated",
        description: `Receipt #${payment.receipt_number} issued for ₹${payAmountRupees}. Outstanding updated.`,
        type: "success",
      });

      setIsPaymentOpen(false);
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, type: "error" });
    }
  };

  // Filter charges
  const filteredCharges = rentCharges.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchResident = c.resident?.full_name.toLowerCase().includes(q);
      const matchMonth = c.billing_month.includes(q);
      if (!matchResident && !matchMonth) return false;
    }
    return true;
  });

  const totalBilledPaise = filteredCharges.reduce((acc, c) => acc + c.amount_paise + c.late_fee_paise, 0);
  const totalCollectedPaise = filteredCharges.reduce((acc, c) => acc + c.amount_paid_paise, 0);
  const totalOutstandingPaise = Math.max(0, totalBilledPaise - totalCollectedPaise);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rent Collection & Invoicing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated monthly billing, partial payments, and overdue tracking for all active residents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsGenerateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
            <Receipt className="h-3.5 w-3.5 mr-1" /> Generate Monthly Rent
          </Button>
        </div>
      </div>

      {/* Financial KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Billed</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatINR(totalBilledPaise)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredCharges.length} billing charges</p>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(totalCollectedPaise)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Realization: {totalBilledPaise > 0 ? Math.round((totalCollectedPaise / totalBilledPaise) * 100) : 0}%
          </p>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-amber-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Outstanding Balance</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatINR(totalOutstandingPaise)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {filteredCharges.filter((c) => c.status === "overdue").length} overdue charges
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-500 font-medium hidden md:inline">Status:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              {["all", "unpaid", "partially_paid", "paid", "overdue"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md capitalize font-medium transition-all ${
                    statusFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search resident name, month..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Rent Charges Table */}
      <Card className="overflow-hidden border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Amount Due</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Outstanding</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCharges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No rent charges match your criteria.
                  </td>
                </tr>
              ) : (
                filteredCharges.map((charge) => {
                  const totalDue = charge.amount_paise + charge.late_fee_paise;
                  const pending = Math.max(0, totalDue - charge.amount_paid_paise);
                  return (
                    <tr key={charge.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/residents/${charge.resident_id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {charge.resident?.full_name || "Resident"}
                        </Link>
                        <p className="text-[11px] text-slate-400">{charge.property?.name}</p>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {charge.billing_month}
                      </td>

                      <td className="py-3 px-4 text-slate-600">{formatDate(charge.due_date)}</td>

                      <td className="py-3 px-4 font-bold text-slate-900">{formatINR(totalDue)}</td>

                      <td className="py-3 px-4 font-semibold text-emerald-600">
                        {formatINR(charge.amount_paid_paise)}
                      </td>

                      <td className="py-3 px-4 font-bold text-amber-600">{formatINR(pending)}</td>

                      <td className="py-3 px-4">
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

                      <td className="py-3 px-4 text-right">
                        {charge.status !== "paid" ? (
                          <Button
                            size="sm"
                            onClick={() => openPaymentForCharge(charge)}
                            className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700"
                          >
                            <CreditCard className="mr-1 h-3 w-3" /> Record Payment
                          </Button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center justify-end">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Cleared
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Generate Monthly Rent Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Monthly Rent Charges</DialogTitle>
            <DialogDescription>
              Generates billing records for all currently active stays. Idempotency guarantees no double billing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGenerateRent} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Billing Month</label>
              <Input
                type="date"
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Normalized to 1st of month (e.g. 2026-11-01)</p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Rent Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px]">
              <strong>Idempotent Safe Run:</strong> If a resident already has a charge for {billingMonth}, the system will skip them without duplicating!
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsGenerateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                Run Rent Generation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      {selectedChargeForPay && (
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Rent Payment</DialogTitle>
              <DialogDescription>
                Issuing payment receipt for {selectedChargeForPay.resident?.full_name}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-slate-600">
                  Billing Period: <strong>{selectedChargeForPay.billing_month}</strong>
                </p>
                <p className="text-slate-600">
                  Charge Amount: <strong>{formatINR(selectedChargeForPay.amount_paise)}</strong>
                </p>
                <p className="text-slate-600">
                  Previously Paid: <strong>{formatINR(selectedChargeForPay.amount_paid_paise)}</strong>
                </p>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Amount Receiving (₹ INR)</label>
                <Input
                  type="number"
                  min={1}
                  value={payAmountRupees}
                  onChange={(e) => setPayAmountRupees(Number(e.target.value))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                  >
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="cash">Cash in Office</option>
                    <option value="bank_transfer">Bank Transfer (IMPS/NEFT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Transaction / Reference #</label>
                  <Input
                    placeholder="e.g. UPI/12345678"
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsPaymentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save Payment & Issue Receipt
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
