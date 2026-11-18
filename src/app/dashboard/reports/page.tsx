"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { formatINR, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, FileText, CheckCircle2, BedDouble, Users, Receipt, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeReport, setActiveReport] = React.useState<"occupancy" | "vacant" | "collection" | "dues">("occupancy");

  const beds = appStore.getBeds();
  const residents = appStore.getResidents();
  const payments = appStore.getPayments();
  const rentCharges = appStore.getRentCharges();

  // Helper to trigger browser CSV file download
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((cell) => `"${cell}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Export Generated",
      description: `Downloaded ${filename} successfully.`,
      type: "success",
    });
  };

  const exportCurrentReport = () => {
    const dateStr = new Date().toISOString().split("T")[0];

    if (activeReport === "occupancy") {
      const headers = ["Bed Code", "Room", "Property", "Sharing Type", "Status", "Resident Name", "Monthly Rent (INR)"];
      const rows = beds.map((b) => [
        b.bed_identifier,
        b.room?.room_number || "—",
        b.room?.property_id || "Green Nest PG",
        b.room?.room_type || "Double",
        b.status,
        b.current_resident?.full_name || "Vacant",
        Math.round((b.room?.base_rent_paise || 0) / 100),
      ]);
      downloadCSV(`staymanage_occupancy_report_${dateStr}.csv`, headers, rows);
    } else if (activeReport === "vacant") {
      const vacantBeds = beds.filter((b) => b.status === "available");
      const headers = ["Bed Code", "Room", "Floor", "Type", "Base Rent (INR)"];
      const rows = vacantBeds.map((b) => [
        b.bed_identifier,
        b.room?.room_number || "—",
        b.room?.floor_number || 1,
        b.room?.room_type || "Double",
        Math.round((b.room?.base_rent_paise || 0) / 100),
      ]);
      downloadCSV(`staymanage_vacant_beds_${dateStr}.csv`, headers, rows);
    } else if (activeReport === "collection") {
      const headers = ["Receipt No", "Payment Date", "Resident Name", "Method", "Reference", "Amount (INR)"];
      const rows = payments.map((p) => [
        p.receipt_number,
        p.payment_date,
        p.resident?.full_name || "Resident",
        p.payment_method,
        p.reference_number || "—",
        Math.round(p.amount_paise / 100),
      ]);
      downloadCSV(`staymanage_collections_${dateStr}.csv`, headers, rows);
    } else if (activeReport === "dues") {
      const unpaid = rentCharges.filter((c) => c.status !== "paid");
      const headers = ["Resident Name", "Billing Month", "Due Date", "Billed Amount (INR)", "Paid (INR)", "Outstanding (INR)", "Status"];
      const rows = unpaid.map((c) => {
        const total = c.amount_paise + c.late_fee_paise;
        const pending = Math.max(0, total - c.amount_paid_paise);
        return [
          c.resident?.full_name || "Resident",
          c.billing_month,
          c.due_date,
          Math.round(total / 100),
          Math.round(c.amount_paid_paise / 100),
          Math.round(pending / 100),
          c.status,
        ];
      });
      downloadCSV(`staymanage_pending_dues_${dateStr}.csv`, headers, rows);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics Exporter</h1>
          <p className="text-xs text-slate-500 mt-1">
            Export comprehensive occupancy reports, payment audits, and pending dues to CSV
          </p>
        </div>
        <Button onClick={exportCurrentReport} className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8 text-white">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export Selected CSV
        </Button>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <button
          onClick={() => setActiveReport("occupancy")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeReport === "occupancy"
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 text-blue-950 font-semibold"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <BedDouble className="h-4 w-4 mb-2 text-blue-600" />
          <p className="font-bold text-sm">Full Occupancy</p>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5">{beds.length} Total Beds Status</p>
        </button>

        <button
          onClick={() => setActiveReport("vacant")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeReport === "vacant"
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 text-blue-950 font-semibold"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 mb-2 text-emerald-600" />
          <p className="font-bold text-sm">Vacant Beds</p>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5">
            {beds.filter((b) => b.status === "available").length} Ready for Booking
          </p>
        </button>

        <button
          onClick={() => setActiveReport("collection")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeReport === "collection"
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 text-blue-950 font-semibold"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Receipt className="h-4 w-4 mb-2 text-indigo-600" />
          <p className="font-bold text-sm">Rent Collections</p>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5">{payments.length} Verified Receipts</p>
        </button>

        <button
          onClick={() => setActiveReport("dues")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeReport === "dues"
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 text-blue-950 font-semibold"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Clock className="h-4 w-4 mb-2 text-amber-600" />
          <p className="font-bold text-sm">Pending Dues</p>
          <p className="text-[11px] text-slate-500 font-normal mt-0.5">
            {rentCharges.filter((c) => c.status !== "paid").length} Unsettled Accounts
          </p>
        </button>
      </div>

      {/* Preview Table */}
      <Card className="overflow-hidden border-slate-200 bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold capitalize">{activeReport.replace("_", " ")} Report Preview</CardTitle>
            <CardDescription>Live database snapshot ready for export</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={exportCurrentReport} className="text-xs h-7">
            <Download className="h-3 w-3 mr-1" /> Export CSV
          </Button>
        </CardHeader>

        <div className="overflow-x-auto text-xs">
          {activeReport === "occupancy" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">Bed Identifier</th>
                  <th className="py-2.5 px-4">Room</th>
                  <th className="py-2.5 px-4">Sharing</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Assigned Resident</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {beds.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-mono font-bold">{b.bed_identifier}</td>
                    <td className="py-2.5 px-4">Room {b.room?.room_number || "—"}</td>
                    <td className="py-2.5 px-4 capitalize">{b.room?.room_type || "Double"}</td>
                    <td className="py-2.5 px-4">
                      <Badge variant={b.status === "occupied" ? "default" : "success"} className="text-[10px]">
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {b.current_resident?.full_name || <span className="text-slate-400">Vacant</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === "vacant" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">Bed Identifier</th>
                  <th className="py-2.5 px-4">Room</th>
                  <th className="py-2.5 px-4">Floor</th>
                  <th className="py-2.5 px-4">Sharing Type</th>
                  <th className="py-2.5 px-4">Base Rent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {beds
                  .filter((b) => b.status === "available")
                  .map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">{b.bed_identifier}</td>
                      <td className="py-2.5 px-4">Room {b.room?.room_number}</td>
                      <td className="py-2.5 px-4">Floor {b.room?.floor_number}</td>
                      <td className="py-2.5 px-4 capitalize">{b.room?.room_type}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">{formatINR(b.room?.base_rent_paise || 0)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeReport === "collection" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">Receipt #</th>
                  <th className="py-2.5 px-4">Payment Date</th>
                  <th className="py-2.5 px-4">Resident</th>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-mono font-bold">{p.receipt_number}</td>
                    <td className="py-2.5 px-4 text-slate-600">{formatDate(p.payment_date)}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{p.resident?.full_name}</td>
                    <td className="py-2.5 px-4 uppercase text-[10px]">{p.payment_method}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-600">{formatINR(p.amount_paise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === "dues" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-4">Resident</th>
                  <th className="py-2.5 px-4">Billing Month</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Billed Total</th>
                  <th className="py-2.5 px-4">Paid</th>
                  <th className="py-2.5 px-4">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentCharges
                  .filter((c) => c.status !== "paid")
                  .map((c) => {
                    const total = c.amount_paise + c.late_fee_paise;
                    const pending = Math.max(0, total - c.amount_paid_paise);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 font-semibold text-slate-900">{c.resident?.full_name}</td>
                        <td className="py-2.5 px-4 font-mono">{c.billing_month}</td>
                        <td className="py-2.5 px-4 text-slate-600">{formatDate(c.due_date)}</td>
                        <td className="py-2.5 px-4">{formatINR(total)}</td>
                        <td className="py-2.5 px-4 text-emerald-600">{formatINR(c.amount_paid_paise)}</td>
                        <td className="py-2.5 px-4 font-bold text-amber-600">{formatINR(pending)}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
