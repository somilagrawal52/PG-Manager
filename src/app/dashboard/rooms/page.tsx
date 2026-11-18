"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { Property, Room, Bed, RoomType } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  BedDouble,
  Building2,
  Plus,
  Filter,
  Layers,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  Eye,
  Search,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

export default function RoomsPage() {
  const { toast } = useToast();

  const [properties, setProperties] = React.useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string>("all");
  const [selectedFloor, setSelectedFloor] = React.useState<string>("all");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [beds, setBeds] = React.useState<Bed[]>([]);

  // Dialog states
  const [isAddRoomOpen, setIsAddRoomOpen] = React.useState(false);
  const [selectedBedForDetail, setSelectedBedForDetail] = React.useState<Bed | null>(null);

  // New room form state
  const [newRoomNumber, setNewRoomNumber] = React.useState("");
  const [newRoomFloor, setNewRoomFloor] = React.useState(1);
  const [newRoomType, setNewRoomType] = React.useState<RoomType>("double");
  const [newRoomCapacity, setNewRoomCapacity] = React.useState(2);
  const [newRoomRentRupees, setNewRoomRentRupees] = React.useState(7500);
  const [newRoomPropertyId, setNewRoomPropertyId] = React.useState("");

  const loadData = React.useCallback(() => {
    const props = appStore.getProperties();
    setProperties(props);
    if (!newRoomPropertyId && props.length > 0) {
      setNewRoomPropertyId(props[0].id);
    }
    const propFilter = selectedPropertyId === "all" ? undefined : selectedPropertyId;
    setRooms(appStore.getRooms(propFilter));
    setBeds(appStore.getBeds());
  }, [newRoomPropertyId, selectedPropertyId]);

  React.useEffect(() => {
    loadData();
    const unsubscribe = appStore.subscribe(loadData);
    return unsubscribe;
  }, [loadData]);

  // Handle Type Change -> sync capacity
  const handleTypeChange = (type: RoomType) => {
    setNewRoomType(type);
    if (type === "single") setNewRoomCapacity(1);
    else if (type === "double") setNewRoomCapacity(2);
    else if (type === "triple") setNewRoomCapacity(3);
    else if (type === "four_plus") setNewRoomCapacity(4);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const room = appStore.createRoom({
        property_id: newRoomPropertyId,
        room_number: newRoomNumber,
        floor_number: Number(newRoomFloor),
        room_type: newRoomType,
        capacity: Number(newRoomCapacity),
        base_rent_paise: Number(newRoomRentRupees) * 100,
        amenities: ["Attached Washroom", "Cupboards"],
        status: "active",
      });

      toast({
        title: "Room Created Successfully",
        description: `Room ${room.room_number} added with ${newRoomCapacity} auto-generated beds.`,
        type: "success",
      });

      setIsAddRoomOpen(false);
      setNewRoomNumber("");
    } catch (err: any) {
      toast({
        title: "Failed to Create Room",
        description: err?.message || "Please check details.",
        type: "error",
      });
    }
  };

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedFloor !== "all" && r.floor_number.toString() !== selectedFloor) return false;
    if (selectedType !== "all" && r.room_type !== selectedType) return false;
    if (searchQuery && !r.room_number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedStatus !== "all") {
      const roomBeds = beds.filter((b) => b.room_id === r.id);
      if (selectedStatus === "available" && !roomBeds.some((b) => b.status === "available")) return false;
      if (selectedStatus === "occupied" && !roomBeds.every((b) => b.status === "occupied")) return false;
    }
    return true;
  });

  // Group rooms by Floor
  const floorsMap = new Map<number, Room[]>();
  filteredRooms.forEach((r) => {
    const list = floorsMap.get(r.floor_number) || [];
    list.push(r);
    floorsMap.set(r.floor_number, list);
  });
  const sortedFloors = Array.from(floorsMap.keys()).sort((a, b) => a - b);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rooms & Bed Matrix</h1>
          <p className="text-xs text-slate-500 mt-1">
            Floor-wise visual occupancy, individual bed statuses, and resident allocations
          </p>
        </div>
        <Button onClick={() => setIsAddRoomOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add New Room
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Property Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Property</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              <option value="all">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Floor</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              <option value="all">All Floors</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
            </select>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Sharing Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              <option value="all">All Types</option>
              <option value="single">Single Sharing</option>
              <option value="double">Double Sharing</option>
              <option value="triple">Triple Sharing</option>
              <option value="four_plus">Four+ Sharing</option>
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Bed Availability</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="available">Has Vacant Bed</option>
              <option value="occupied">Fully Occupied</option>
            </select>
          </div>

          {/* Search Room */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Search Room #</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="e.g. 101, U-201"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Status Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200">
        <span className="font-semibold text-slate-800">Bed Status Legend:</span>
        <span className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-emerald-500 mr-1.5" />
          Available for Booking
        </span>
        <span className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-indigo-600 mr-1.5" />
          Occupied by Resident
        </span>
        <span className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-amber-500 mr-1.5" />
          Under Maintenance
        </span>
      </div>

      {/* Floor-by-floor Room Matrix */}
      {sortedFloors.length === 0 ? (
        <Card className="p-8 text-center text-slate-500">
          <BedDouble className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold">No rooms match your filter criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the filters or add a new room.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedFloors.map((floorNum) => {
            const floorRooms = floorsMap.get(floorNum) || [];
            return (
              <div key={floorNum} className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Floor {floorNum}</h2>
                  <span className="text-xs text-slate-500">({floorRooms.length} Rooms)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {floorRooms.map((room) => {
                    const roomBeds = beds.filter((b) => b.room_id === room.id);
                    const occupiedCount = roomBeds.filter((b) => b.status === "occupied").length;
                    const isFull = occupiedCount === room.capacity;

                    return (
                      <Card
                        key={room.id}
                        className="hover:shadow-md transition-shadow border-slate-200 flex flex-col justify-between"
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-slate-900">
                                  Room {room.room_number}
                                </span>
                                <Badge variant="secondary" className="text-[10px] uppercase">
                                  {room.room_type}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Rent: <span className="font-semibold text-slate-700">{formatINR(room.base_rent_paise)}</span> / mo
                              </p>
                            </div>
                            <Badge
                              variant={isFull ? "outline" : "success"}
                              className="text-[10px] py-0 px-1.5"
                            >
                              {occupiedCount}/{room.capacity} Beds
                            </Badge>
                          </div>

                          {/* Beds Grid for this room */}
                          <div className="space-y-1.5 pt-1">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              Beds in Room:
                            </p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {roomBeds.map((bed) => {
                                const isOccupied = bed.status === "occupied";
                                return (
                                  <div
                                    key={bed.id}
                                    onClick={() => setSelectedBedForDetail(bed)}
                                    className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                      isOccupied
                                        ? "bg-indigo-50/60 border-indigo-200 hover:bg-indigo-100/70 text-indigo-950"
                                        : "bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/70 text-emerald-950"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs">{bed.bed_identifier}</span>
                                      <span
                                        className={`h-2 w-2 rounded-full ${
                                          isOccupied ? "bg-indigo-600" : "bg-emerald-500"
                                        }`}
                                      />
                                    </div>
                                    <p className="text-[11px] truncate mt-1">
                                      {isOccupied
                                        ? bed.current_resident?.full_name || "Occupied"
                                        : "Vacant (Available)"}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Room Amenities preview */}
                        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between rounded-b-xl">
                          <span className="truncate">
                            {room.amenities.length > 0 ? room.amenities.join(" • ") : "Standard amenities"}
                          </span>
                          <Eye
                            className="h-3.5 w-3.5 text-slate-400 hover:text-blue-600 cursor-pointer shrink-0 ml-1"
                            onClick={() => setSelectedBedForDetail(roomBeds[0] || null)}
                          />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bed Detail Drawer / Modal */}
      {selectedBedForDetail && (
        <Dialog open={!!selectedBedForDetail} onOpenChange={() => setSelectedBedForDetail(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Bed {selectedBedForDetail.bed_identifier}</DialogTitle>
                <Badge
                  variant={selectedBedForDetail.status === "occupied" ? "default" : "success"}
                  className="capitalize"
                >
                  {selectedBedForDetail.status}
                </Badge>
              </div>
              <DialogDescription>
                Property ID: {selectedBedForDetail.property_id} • Room ID: {selectedBedForDetail.room_id}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {selectedBedForDetail.status === "occupied" && selectedBedForDetail.current_resident ? (
                <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-indigo-900">Current Resident</span>
                    <Link
                      href={`/dashboard/residents/${selectedBedForDetail.current_resident.id}`}
                      className="text-blue-600 font-medium hover:underline text-[11px]"
                    >
                      View Full Profile →
                    </Link>
                  </div>
                  <p className="text-base font-bold text-slate-900">
                    {selectedBedForDetail.current_resident.full_name}
                  </p>
                  <p className="text-slate-600">Phone: {selectedBedForDetail.current_resident.phone}</p>
                  <p className="text-slate-600">
                    Check-in Date: {selectedBedForDetail.current_stay?.check_in_date || "—"}
                  </p>
                  <p className="text-slate-600">
                    Monthly Rent: {formatINR(selectedBedForDetail.current_stay?.monthly_rent_paise || 0)}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <p className="font-semibold text-sm">This bed is ready for allocation!</p>
                  <p className="text-slate-600 text-xs">
                    Assign a new resident or transfer an existing tenant to this bed.
                  </p>
                  <Link href="/dashboard/residents">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 mt-1">
                      Allocate Resident Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedBedForDetail(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Room Modal */}
      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Bed codes will be automatically generated based on the selected capacity.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRoom} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Property</label>
              <select
                value={newRoomPropertyId}
                onChange={(e) => setNewRoomPropertyId(e.target.value)}
                className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                required
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Room Number / Name</label>
                <Input
                  placeholder="e.g. 303"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Floor Number</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={newRoomFloor}
                  onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Sharing Type</label>
                <select
                  value={newRoomType}
                  onChange={(e) => handleTypeChange(e.target.value as RoomType)}
                  className="w-full h-8 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="single">Single Sharing</option>
                  <option value="double">Double Sharing</option>
                  <option value="triple">Triple Sharing</option>
                  <option value="four_plus">Four+ Sharing</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Bed Capacity</label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={newRoomCapacity}
                  onChange={(e) => setNewRoomCapacity(Number(e.target.value))}
                  className="h-8 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Base Monthly Rent (₹ INR)</label>
              <Input
                type="number"
                min={1000}
                step={500}
                value={newRoomRentRupees}
                onChange={(e) => setNewRoomRentRupees(Number(e.target.value))}
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px]">
              Will auto-generate beds:{" "}
              <span className="font-semibold">
                {Array.from({ length: newRoomCapacity }, (_, i) => `${newRoomNumber || "ROOM"}-${String.fromCharCode(65 + i)}`).join(", ")}
              </span>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRoomOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                Create Room & Beds
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
