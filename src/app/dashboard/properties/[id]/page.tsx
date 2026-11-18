"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { appStore } from "@/lib/store";
import { Property, Room, Bed } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, MapPin, Phone, BedDouble, Plus, Layers, CheckCircle2 } from "lucide-react";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = React.useState<Property | undefined>(() => appStore.getProperty(propertyId));
  const [rooms, setRooms] = React.useState<Room[]>(() => appStore.getRooms(propertyId));
  const [beds, setBeds] = React.useState<Bed[]>(() => appStore.getBeds());

  React.useEffect(() => {
    const update = () => {
      setProperty(appStore.getProperty(propertyId));
      setRooms(appStore.getRooms(propertyId));
      setBeds(appStore.getBeds());
    };
    update();
    const unsubscribe = appStore.subscribe(update);
    return unsubscribe;
  }, [propertyId]);

  if (!property) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-500">Property not found.</p>
        <Link href="/dashboard/properties">
          <Button size="sm" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
          </Button>
        </Link>
      </div>
    );
  }

  const propBeds = beds.filter((b) => b.property_id === property.id);
  const occupiedBeds = propBeds.filter((b) => b.status === "occupied").length;
  const occupancyRate = propBeds.length > 0 ? Math.round((occupiedBeds / propBeds.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard/properties">
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> All Properties
            </Button>
          </Link>
          <Badge variant="default" className="uppercase text-[10px]">
            {property.property_type.replace("_", " ")}
          </Badge>
        </div>

        <Link href="/dashboard/rooms">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Room to this Property
          </Button>
        </Link>
      </div>

      {/* Main Details Card */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{property.name}</h1>
            <p className="text-xs text-slate-500 flex items-center mt-1">
              <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
              {property.address}, {property.city}, {property.state} — {property.pincode}
            </p>
            <p className="text-xs text-slate-500 flex items-center mt-1">
              <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" /> {property.contact_phone}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-500">Occupancy</p>
              <p className="text-lg font-bold text-emerald-600">{occupancyRate}%</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-500">Rooms</p>
              <p className="text-lg font-bold text-slate-900">{rooms.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-500">Total Beds</p>
              <p className="text-lg font-bold text-slate-900">{propBeds.length}</p>
            </div>
          </div>
        </div>

        {property.rules_and_policies && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-xs font-semibold text-slate-900 mb-1">House Rules & Policies:</h4>
            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {property.rules_and_policies}
            </p>
          </div>
        )}
      </Card>

      {/* Rooms List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Rooms in this Building</h2>
          <span className="text-xs text-slate-500">{rooms.length} Rooms Configured</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const roomBeds = propBeds.filter((b) => b.room_id === room.id);
            const occupied = roomBeds.filter((b) => b.status === "occupied").length;
            return (
              <Card key={room.id} className="p-4 border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">Room {room.room_number}</h3>
                    <p className="text-xs text-slate-500">Floor {room.floor_number} • {room.room_type}</p>
                  </div>
                  <Badge variant={occupied === room.capacity ? "outline" : "success"} className="text-[10px]">
                    {occupied}/{room.capacity} Beds
                  </Badge>
                </div>

                <div className="mt-3 text-xs text-slate-600">
                  <p>Monthly Rent: <strong className="text-slate-900">{formatINR(room.base_rent_paise)}</strong></p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {roomBeds.map((bed) => (
                    <span
                      key={bed.id}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        bed.status === "occupied"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {bed.bed_identifier}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
