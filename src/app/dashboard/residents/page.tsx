"use client";

import * as React from "react";
import Link from "next/link";
import { appStore } from "@/lib/store";
import { Resident, ResidentStatus, Bed, Property } from "@/lib/types";
import { formatINR, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Home,
  CheckCircle2,
  Clock,
  LogOut,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ResidentsPage() {
  const { toast } = useToast();

  const [residents, setResidents] = React.useState<Resident[]>([]);
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [availableBeds, setAvailableBeds] = React.useState<Bed[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Add resident modal state
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [emergencyName, setEmergencyName] = React.useState("");
  const [emergencyPhone, setEmergencyPhone] = React.useState("");
  const [permanentAddress, setPermanentAddress] = React.useState("");
  const [selectedBedId, setSelectedBedId] = React.useState("");
  const [monthlyRentRupees, setMonthlyRentRupees] = React.useState(7000);
  const [securityDepositRupees, setSecurityDepositRupees] = React.useState(14000);
  const [checkInDate, setCheckInDate] = React.useState(() => new Date().toISOString().split("T")[0]);

  const loadData = React.useCallback(() => {
    setResidents(appStore.getResidents());
    setProperties(appStore.getProperties());
    const vacantBeds = appStore.getBeds().filter((b) => b.status === "available");
    setAvailableBeds(vacantBeds);
    if (vacantBeds.length > 0 && !selectedBedId) {
      setSelectedBedId(vacantBeds[0].id);
    }
  }, [selectedBedId]);

  React.useEffect(() => {
    loadData();
    const unsubscribe = appStore.subscribe(loadData);
    return unsubscribe;
  }, [loadData]);

  const handleBedSelect = (bedId: string) => {
    setSelectedBedId(bedId);
    const bed = availableBeds.find((b) => b.id === bedId);
    if (bed && bed.room) {
      const roomRentRupees = Math.round(bed.room.base_rent_paise / 100);
      setMonthlyRentRupees(roomRentRupees);
      setSecurityDepositRupees(roomRentRupees * 2);
    }
  };

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId) {
      toast({ title: "No Bed Selected", description: "Please choose an available bed.", type: "error" });
      return;
    }

    try {
      const selectedBed = availableBeds.find((b) => b.id === selectedBedId);
      if (!selectedBed) throw new Error("Selected bed is not available");

      const newRes = appStore.registerResident(
        {
          full_name: fullName,
          phone,
          email: email || undefined,
          emergency_contact_name: emergencyName || undefined,
          emergency_contact_phone: emergencyPhone || undefined,
          permanent_address: permanentAddress || undefined,
          status: "active",
        },
        {
          bed_id: selectedBedId,
          property_id: selectedBed.property_id,
          monthly_rent_paise: Number(monthlyRentRupees) * 100,
          security_deposit_paise: Number(securityDepositRupees) * 100,
          check_in_date: checkInDate,
          deposit_payment_method: "upi",
        }
      );

      toast({
        title: "Resident Registered & Allocated",
        description: `${newRes.full_name} assigned to Bed ${selectedBed.bed_identifier}.`,
        type: "success",
      });

      setIsAddOpen(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setEmergencyName("");
      setEmergencyPhone("");
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "Could not register resident",
        type: "error",
      });
    }
  };

  const filteredResidents = residents.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = r.full_name.toLowerCase().includes(query);
      const matchPhone = r.phone.toLowerCase().includes(query);
      const matchBed = r.current_stay?.bed?.bed_identifier.toLowerCase().includes(query);
      if (!matchName && !matchPhone && !matchBed) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Resident Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active tenants, bed allocations, stay histories, and move-out settlements
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Onboard Resident
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium hidden sm:inline">Status:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              {["all", "active", "notice", "checked_out"].map((st) => (
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
              placeholder="Search by name, phone, bed #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Residents Table */}
      <Card className="overflow-hidden border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Property & Room</th>
                <th className="py-3 px-4">Assigned Bed</th>
                <th className="py-3 px-4">Monthly Rent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No residents found.
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => {
                  const stay = resident.current_stay;
                  return (
                    <tr key={resident.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {resident.full_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{resident.full_name}</p>
                            <p className="text-[11px] text-slate-500">{resident.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{stay?.property?.name || "—"}</p>
                        <p className="text-[11px] text-slate-500">
                          {stay?.room ? `Room ${stay.room.room_number}` : "Unallocated"}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        {stay?.bed ? (
                          <Badge variant="default" className="font-mono text-[11px] font-semibold">
                            {stay.bed.bed_identifier}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">
                          {formatINR(stay?.monthly_rent_paise || 0)}
                        </p>
                        <p className="text-[10px] text-slate-400">Due: 5th of month</p>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            resident.status === "active"
                              ? "success"
                              : resident.status === "notice"
                              ? "warning"
                              : "secondary"
                          }
                          className="capitalize text-[10px]"
                        >
                          {resident.status.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Link href={`/dashboard/residents/${resident.id}`}>
                          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
                            Profile & Ledger <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Onboard Resident Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Onboard New Resident</DialogTitle>
            <DialogDescription>
              Register personal details, select an available bed, and record security deposit
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddResident} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <Input
                  placeholder="e.g. Ankit Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone Number (WhatsApp)</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="ankit@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Check-in Date</label>
                <Input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Bed Allocation Selection */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
              <label className="block font-semibold text-blue-950 text-xs">
                Select Available Bed ({availableBeds.length} vacant)
              </label>
              {availableBeds.length === 0 ? (
                <p className="text-red-600 text-xs">No beds currently available. Add a room first.</p>
              ) : (
                <select
                  value={selectedBedId}
                  onChange={(e) => handleBedSelect(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium"
                  required
                >
                  {availableBeds.map((bed) => {
                    const prop = properties.find((p) => p.id === bed.property_id);
                    return (
                      <option key={bed.id} value={bed.id}>
                        {prop?.name} • Room {bed.room?.room_number} (Bed {bed.bed_identifier}) • Rent: ₹
                        {Math.round((bed.room?.base_rent_paise || 600000) / 100)}/mo
                      </option>
                    );
                  })}
                </select>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Agreed Monthly Rent (₹)</label>
                  <Input
                    type="number"
                    step={100}
                    value={monthlyRentRupees}
                    onChange={(e) => setMonthlyRentRupees(Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Security Deposit (₹)</label>
                  <Input
                    type="number"
                    step={100}
                    value={securityDepositRupees}
                    onChange={(e) => setSecurityDepositRupees(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Emergency & Address details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Emergency Contact Person</label>
                <Input
                  placeholder="e.g. Ramesh Sharma (Father)"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Emergency Phone</label>
                <Input
                  placeholder="+91 98450 11223"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Permanent Home Address</label>
              <Input
                placeholder="House/Street, City, State"
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                Register & Occupy Bed
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
