"use client";

import * as React from "react";
import Link from "next/link";
import { appStore } from "@/lib/store";
import { DepositTransaction, Resident, Property } from "@/lib/types";
import { formatINR, formatDate, calculateDepositBalance } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, Plus, Search, AlertCircle, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function DepositsPage() {
  const { toast } = useToast();

  const [transactions, setTransactions] = React.useState<DepositTransaction[]>([]);
  const [residents, setResidents] = React.useState<Resident[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");

  // New deposit transaction modal
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedResidentId, setSelectedResidentId] = React.useState("");
  const [txType, setTxType] = React.useState<"collected" | "deduction" | "refund">("collected");
  const [amountRupees, setAmountRupees] = React.useState(10000);
  const [reason, setReason] = React.useState("Security deposit collected");
  const [method, setMethod] = React.useState<"upi" | "bank_transfer" | "cash">("upi");
  const [reference, setReference] = React.useState("");

  const loadData = React.useCallback(() => {
    setTransactions(appStore.getState().depositTransactions);
    const resList = appStore.getResidents();
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

  const depositSummary = calculateDepositBalance(transactions);

  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const resident = residents.find((r) => r.id === selectedResidentId);
    if (!resident) return;

    const resTxs = transactions.filter((t) => t.resident_id === selectedResidentId);
    const resBalance = calculateDepositBalance(resTxs);

    const amountPaise = Number(amountRupees) * 100;
    if ((txType === "deduction" || txType === "refund") && amountPaise > resBalance.balance) {
      toast({
        title: "Overdraft Prevented",
        description: `Cannot ${txType} ₹${amountRupees}. Available balance for ${resident.full_name} is ${formatINR(resBalance.balance)}.`,
        type: "error",
      });
      return;
    }

    const currentStay = resident.current_stay;
    const propertyId = currentStay?.property_id || appStore.getProperties()[0].id;
    const stayId = currentStay?.id || `stay-legacy-${Date.now()}`;

    const newTx: DepositTransaction = {
      id: `dep-${Date.now()}`,
      resident_id: selectedResidentId,
      stay_id: stayId,
      property_id: propertyId,
      transaction_type: txType,
      amount_paise: amountPaise,
      reason,
      payment_method: method,
      reference_number: reference || undefined,
      transaction_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    };

    appStore.getState().depositTransactions = [newTx, ...appStore.getState().depositTransactions];
    toast({
      title: "Deposit Ledger Updated",
      description: `Recorded ${txType.toUpperCase()} of ${formatINR(amountPaise)} for ${resident.full_name}.`,
      type: "success",
    });

    setIsOpen(false);
  };

  const filteredTxs = transactions.filter((t) => {
    if (typeFilter !== "all" && t.transaction_type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const res = residents.find((r) => r.id === t.resident_id);
      const matchName = res?.full_name.toLowerCase().includes(q);
      const matchReason = t.reason.toLowerCase().includes(q);
      if (!matchName && !matchReason) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Security Deposit Escrow</h1>
          <p className="text-xs text-slate-500 mt-1">
            Isolated tenant deposit balances, damage deductions, and move-out refund settlements
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Record Deposit Entry
        </Button>
      </div>

      {/* Escrow KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-l-4 border-l-blue-600">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Escrow Balance</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{formatINR(depositSummary.balance)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Held in trust for residents</p>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-emerald-600">
          <p className="text-xs font-semibold text-slate-500 uppercase">Gross Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatINR(depositSummary.collected)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total lifetime deposits received</p>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-rose-600">
          <p className="text-xs font-semibold text-slate-500 uppercase">Damage Deductions</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{formatINR(depositSummary.deductions)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cleaning, repairs, & rent adjustments</p>
        </Card>

        <Card className="p-4 bg-white border-l-4 border-l-purple-600">
          <p className="text-xs font-semibold text-slate-500 uppercase">Refunds Settled</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{formatINR(depositSummary.refunds)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Returned upon checkout</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Type:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              {["all", "collected", "deduction", "refund"].map((tp) => (
                <button
                  key={tp}
                  onClick={() => setTypeFilter(tp)}
                  className={`px-3 py-1 rounded-md capitalize font-medium transition-all ${
                    typeFilter === tp ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search resident or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Deposit Ledger Table */}
      <Card className="overflow-hidden border-slate-200 bg-white">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reason & Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No deposit transactions found.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const res = residents.find((r) => r.id === tx.resident_id);
                  const isCollected = tx.transaction_type === "collected";
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-600">{formatDate(tx.transaction_date)}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/residents/${tx.resident_id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {res?.full_name || "Resident"}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            isCollected ? "default" : tx.transaction_type === "deduction" ? "destructive" : "purple"
                          }
                          className="uppercase text-[10px]"
                        >
                          {tx.transaction_type}
                        </Badge>
                      </td>
                      <td
                        className={`py-3 px-4 font-bold ${
                          isCollected ? "text-blue-600" : "text-rose-600"
                        }`}
                      >
                        {isCollected ? "+" : "-"}
                        {formatINR(tx.amount_paise)}
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] text-slate-600">
                        {tx.payment_method}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <p>{tx.reason}</p>
                        {tx.reference_number && (
                          <p className="text-[10px] text-slate-400 font-mono">{tx.reference_number}</p>
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

      {/* Record Deposit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Security Deposit Entry</DialogTitle>
            <DialogDescription>
              Record deposit collection, inspection deductions, or partial refunds
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecordTransaction} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Resident</label>
              <select
                value={selectedResidentId}
                onChange={(e) => setSelectedResidentId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium"
                required
              >
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.full_name} ({r.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Transaction Type</label>
                <select
                  value={txType}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setTxType(newType);
                    if (newType === "collected") setReason("Security deposit collected");
                    else if (newType === "deduction") setReason("Damage & maintenance deduction");
                    else setReason("Refund settled");
                  }}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="collected">Deposit Collected</option>
                  <option value="deduction">Deduction (Damages/Penalty)</option>
                  <option value="refund">Refund to Resident</option>
                </select>
              </div>

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
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Reason / Description</label>
              <Input value={reason} onChange={(e) => setReason(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Reference #</label>
                <Input
                  placeholder="e.g. UTR / Receipt No"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                Confirm Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
