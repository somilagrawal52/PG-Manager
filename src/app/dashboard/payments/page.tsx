"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { Payment, Property, Resident } from "@/lib/types";
import { formatINR, formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreditCard, Receipt, Plus, Search, Printer, Download, CheckCircle2, Building2, User } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function PaymentsPage() {
  const { toast } = useToast();

  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [residents, setResidents] = React.useState<Resident[]>([]);
  const [methodFilter, setMethodFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Record Manual Payment Dialog
  const [isRecordOpen, setIsRecordOpen] = React.useState(false);
  const [selectedResidentId, setSelectedResidentId] = React.useState("");
  const [amountRupees, setAmountRupees] = React.useState(7000);
  const [paymentMethod, setPaymentMethod] = React.useState<"upi" | "cash" | "bank_transfer">("upi");
  const [paymentDate, setPaymentDate] = React.useState(() => new Date().toISOString().split("T")[0]);
  const [referenceNumber, setReferenceNumber] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Receipt Modal Dialog
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = React.useState<Payment | null>(null);

  const loadData = React.useCallback(() => {
    setPayments(appStore.getPayments());
    setProperties(appStore.getProperties());
    const resList = appStore.getResidents().filter((r) => r.status === "active");
    setResidents(resList);
    if (resList.length > 0 && !selectedResidentId) {
      setSelectedResidentId(resList[0].id);
    }
  }, [selectedResidentId]);

  React.useEffect(() => {
    loadData();
    const unsubscribe = appStore.subscribe(loadData);
    return unsubscribe;
  }, [loadData]);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payment = appStore.recordPayment({
        resident_id: selectedResidentId,
        amount_paise: Number(amountRupees) * 100,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        reference_number: referenceNumber,
        notes,
      });

      toast({
        title: "Payment Recorded",
        description: `Receipt #${payment.receipt_number} issued for ${formatINR(payment.amount_paise)}.`,
        type: "success",
      });

      setIsRecordOpen(false);
      setReferenceNumber("");
      setNotes("");
    } catch (err: any) {
      toast({ title: "Failed to record payment", description: err.message, type: "error" });
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (methodFilter !== "all" && p.payment_method !== methodFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.resident?.full_name.toLowerCase().includes(q);
      const matchReceipt = p.receipt_number.toLowerCase().includes(q);
      if (!matchName && !matchReceipt) return false;
    }
    return true;
  });

  const totalCollectedPaise = filteredPayments.reduce((acc, p) => acc + p.amount_paise, 0);

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Transactions & Receipts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manual payment ledger, UPI UTR verification, and printable GST-ready payment receipts
          </p>
        </div>
        <Button onClick={() => setIsRecordOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Record New Payment
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
        <Card className="p-4 bg-white border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Payments Logged</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(totalCollectedPaise)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{filteredPayments.length} verified transactions</p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">UPI Collections</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatINR(
              filteredPayments
                .filter((p) => p.payment_method === "upi")
                .reduce((acc, p) => acc + p.amount_paise, 0)
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Google Pay / PhonePe / Paytm</p>
        </Card>
        <Card className="p-4 bg-white border-l-4 border-l-slate-500">
          <p className="text-xs font-semibold text-slate-500 uppercase">Cash & Bank Transfer</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">
            {formatINR(
              filteredPayments
                .filter((p) => p.payment_method !== "upi")
                .reduce((acc, p) => acc + p.amount_paise, 0)
            )}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Physical office receipts & NEFT/IMPS</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Method:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              {["all", "upi", "cash", "bank_transfer"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1 rounded-md capitalize font-medium transition-all ${
                    methodFilter === m ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {m.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search receipt # or resident..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="overflow-hidden border-slate-200 bg-white no-print">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Property</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {payment.receipt_number}
                    </td>

                    <td className="py-3 px-4 text-slate-600">{formatDate(payment.payment_date)}</td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {payment.resident?.full_name || "Resident"}
                    </td>

                    <td className="py-3 px-4 text-slate-600">{payment.property?.name || "—"}</td>

                    <td className="py-3 px-4">
                      <Badge variant="secondary" className="uppercase text-[9px]">
                        {payment.payment_method}
                      </Badge>
                      {payment.reference_number && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
                          {payment.reference_number}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-emerald-600">
                      +{formatINR(payment.amount_paise)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPaymentForReceipt(payment)}
                        className="h-7 text-[11px] px-2.5"
                      >
                        <Receipt className="h-3 w-3 mr-1 text-blue-600" /> View Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Manual Payment</DialogTitle>
            <DialogDescription>
              Record an offline or UPI payment received from a resident. Generates official receipt.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Resident</label>
              <select
                value={selectedResidentId}
                onChange={(e) => {
                  setSelectedResidentId(e.target.value);
                  const res = residents.find((r) => r.id === e.target.value);
                  if (res?.current_stay) {
                    setAmountRupees(Math.round(res.current_stay.monthly_rent_paise / 100));
                  }
                }}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium"
                required
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.full_name} ({r.phone}) • {r.current_stay?.property?.name || ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Amount (₹ INR)</label>
                <Input
                  type="number"
                  min={1}
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Date</label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="cash">Cash in Hand</option>
                  <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">UTR / Reference No.</label>
                <Input
                  placeholder="e.g. 312456789012"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Notes / Description</label>
              <Input
                placeholder="e.g. November 2026 rent payment"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsRecordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Confirm & Issue Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Payment Receipt Modal (Printable) */}
      {selectedPaymentForReceipt && (
        <Dialog open={!!selectedPaymentForReceipt} onOpenChange={() => setSelectedPaymentForReceipt(null)}>
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            {/* Printable Receipt Paper */}
            <div id="receipt-print-area" className="p-6 bg-white space-y-5 text-xs text-slate-800">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      SM
                    </div>
                    <span className="font-bold text-base text-slate-900">StayManage Demo Properties</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">12th Main, 4th Block, Koramangala, Bengaluru, Karnataka</p>
                  <p className="text-[11px] text-slate-500">GSTIN: 29AAAAA0000A1Z5 • Phone: +91 98765 43210</p>
                </div>

                <div className="text-right">
                  <Badge variant="success" className="text-xs uppercase font-bold py-0.5 px-2">
                    Payment Receipt
                  </Badge>
                  <p className="font-mono font-bold text-slate-900 mt-1 text-sm">
                    {selectedPaymentForReceipt.receipt_number}
                  </p>
                  <p className="text-[11px] text-slate-500">Date: {formatDate(selectedPaymentForReceipt.payment_date)}</p>
                </div>
              </div>

              {/* Resident & Property details */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Received From:</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedPaymentForReceipt.resident?.full_name}
                  </p>
                  <p className="text-[11px] text-slate-600">Phone: {selectedPaymentForReceipt.resident?.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Accommodation:</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {selectedPaymentForReceipt.property?.name}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Room {selectedPaymentForReceipt.resident?.current_stay?.room?.room_number || "—"} (Bed {selectedPaymentForReceipt.resident?.current_stay?.bed?.bed_identifier || "—"})
                  </p>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 font-semibold text-slate-700">
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Mode</th>
                      <th className="p-2.5">Reference #</th>
                      <th className="p-2.5 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-2.5 font-medium">Monthly Rent Payment</td>
                      <td className="p-2.5 uppercase font-medium">{selectedPaymentForReceipt.payment_method}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-500">
                        {selectedPaymentForReceipt.reference_number || "Cash Rec."}
                      </td>
                      <td className="p-2.5 font-bold text-right text-slate-900">
                        {formatINR(selectedPaymentForReceipt.amount_paise)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={3} className="p-2.5 text-right">Total Amount Received:</td>
                      <td className="p-2.5 text-right text-emerald-600 text-sm">
                        {formatINR(selectedPaymentForReceipt.amount_paise)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Authorization Note */}
              <div className="pt-2 flex justify-between items-end text-[10px] text-slate-400">
                <p>This is a computer-generated receipt valid for HRA & Tax declaration purposes.</p>
                <div className="text-right">
                  <p className="font-semibold text-slate-700">StayManage Official</p>
                  <p>Authorized Signatory</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center no-print">
              <Button variant="outline" size="sm" onClick={() => setSelectedPaymentForReceipt(null)}>
                Close
              </Button>
              <div className="flex space-x-2">
                <Button size="sm" onClick={printReceipt} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / Save PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
