"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { RentCharge, Payment, Resident } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Receipt, CreditCard, Printer, CheckCircle2, Clock, QrCode, Download, ArrowUpRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ResidentRentPage() {
  const { toast } = useToast();
  const residentId = "res-001";

  const [resident, setResident] = React.useState<Resident | undefined>(() => appStore.getResident(residentId));
  const [rentCharges, setRentCharges] = React.useState<RentCharge[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);

  // Receipt Modal
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null);

  React.useEffect(() => {
    const update = () => {
      setResident(appStore.getResident(residentId));
      setRentCharges(appStore.getRentCharges().filter((c) => c.resident_id === residentId));
      setPayments(appStore.getPayments().filter((p) => p.resident_id === residentId));
    };
    update();
    const unsubscribe = appStore.subscribe(update);
    return unsubscribe;
  }, []);

  const totalOutstandingPaise = rentCharges.reduce((acc, c) => {
    const total = c.amount_paise + c.late_fee_paise;
    return acc + Math.max(0, total - c.amount_paid_paise);
  }, 0);

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Rent Invoices & Payment Receipts</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View monthly dues, UPI payment details, and download official HRA tax declaration receipts
        </p>
      </div>

      {/* Dues Banner */}
      <Card className="p-5 border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase text-slate-400">Total Outstanding Balance</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {totalOutstandingPaise === 0 ? "₹0.00" : formatINR(totalOutstandingPaise)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Due on or before the 5th of each month via Google Pay, PhonePe, or Bank Transfer
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-950 space-y-1">
            <p className="font-semibold flex items-center">
              <QrCode className="h-4 w-4 mr-1 text-blue-600" /> Property UPI ID:
            </p>
            <p className="font-mono text-sm font-bold text-blue-800">greennest.rent@icici</p>
            <p className="text-[10px] text-slate-500">Mention your Room 101 in transaction remarks</p>
          </div>
        </div>
      </Card>

      {/* Rent Invoices Table */}
      <Card className="overflow-hidden border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold">Monthly Invoices</CardTitle>
          <CardDescription>Billing charges issued by property management</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-4">Billing Month</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4">Billed Amount</th>
                <th className="py-2.5 px-4">Paid So Far</th>
                <th className="py-2.5 px-4">Pending</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentCharges.map((charge) => {
                const total = charge.amount_paise + charge.late_fee_paise;
                const pending = Math.max(0, total - charge.amount_paid_paise);
                return (
                  <tr key={charge.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{charge.billing_month}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(charge.due_date)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(total)}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">{formatINR(charge.amount_paid_paise)}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Verified Payment Receipts */}
      <Card className="overflow-hidden border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold">Payment History & HRA Receipts</CardTitle>
          <CardDescription>Official verified receipts eligible for tax exemptions</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-4">Receipt #</th>
                <th className="py-2.5 px-4">Payment Date</th>
                <th className="py-2.5 px-4">Payment Mode</th>
                <th className="py-2.5 px-4">Amount Paid</th>
                <th className="py-2.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.receipt_number}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(p.payment_date)}</td>
                    <td className="py-3 px-4 uppercase text-[10px]">
                      <Badge variant="secondary">{p.payment_method}</Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">{formatINR(p.amount_paise)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPayment(p)}
                        className="h-7 text-[11px] px-2.5"
                      >
                        <Receipt className="h-3 w-3 mr-1 text-blue-600" /> View / Print PDF
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Official Receipt Dialog */}
      {selectedPayment && (
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <div id="resident-receipt-print" className="p-6 bg-white space-y-4 text-xs text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">StayManage Demo Properties</h3>
                  <p className="text-[11px] text-slate-500">Green Nest PG, Koramangala 6th Block, Bengaluru</p>
                  <p className="text-[10px] text-slate-400">GSTIN: 29AAAAA0000A1Z5</p>
                </div>
                <div className="text-right">
                  <Badge variant="success" className="text-xs uppercase">
                    Rent Receipt
                  </Badge>
                  <p className="font-mono font-bold text-slate-900 mt-1">{selectedPayment.receipt_number}</p>
                  <p className="text-[11px] text-slate-500">Date: {formatDate(selectedPayment.payment_date)}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">Tenant Name:</p>
                  <p className="font-bold text-slate-900">{resident?.full_name}</p>
                  <p className="text-[11px] text-slate-500">{resident?.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-semibold">Allocated Bed:</p>
                  <p className="font-semibold text-slate-900">
                    Room {resident?.current_stay?.room?.room_number} (Bed {resident?.current_stay?.bed?.bed_identifier})
                  </p>
                  <p className="text-[11px] text-slate-500">{resident?.current_stay?.property?.name}</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 font-semibold">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2">Method</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-2">November 2026 Monthly Accommodation Rent</td>
                      <td className="p-2 uppercase">{selectedPayment.payment_method}</td>
                      <td className="p-2 text-right font-bold">{formatINR(selectedPayment.amount_paise)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={2} className="p-2 text-right">Total Paid:</td>
                      <td className="p-2 text-right text-emerald-600">{formatINR(selectedPayment.amount_paise)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="pt-2 flex justify-between items-end text-[10px] text-slate-400">
                <p>Eligible for HRA Tax Deduction under Section 10(13A).</p>
                <div className="text-right">
                  <p className="font-semibold text-slate-700">Property Manager</p>
                  <p>Authorized Signature</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center no-print">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
              <Button size="sm" onClick={printReceipt} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / Save PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
