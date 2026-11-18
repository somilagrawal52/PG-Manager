"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { Resident, Bed } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Users, Sparkles, Shield, CheckCircle2, MapPin } from "lucide-react";

export default function ResidentRoomPage() {
  const residentId = "res-001";
  const [resident, setResident] = React.useState<Resident | undefined>(() => appStore.getResident(residentId));
  const [roommates, setRoommates] = React.useState<Resident[]>([]);

  React.useEffect(() => {
    const res = appStore.getResident(residentId);
    setResident(res);
    if (res?.current_stay?.room) {
      const roomId = res.current_stay.room.id;
      const roomBeds = appStore.getBeds(roomId);
      const mates = roomBeds
        .filter((b) => b.id !== res.current_stay?.bed_id && b.current_resident)
        .map((b) => b.current_resident!);
      setRoommates(mates);
    }
  }, []);

  const stay = resident?.current_stay;
  const room = stay?.room;
  const property = stay?.property;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">My Accommodation</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Room specifications, roommates, included amenities, and building policies
        </p>
      </div>

      {/* Room Overview Card */}
      <Card className="p-5 border-slate-200 bg-white space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {property?.name || "Green Nest PG"}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Room {room?.room_number || "101"} — Bed {stay?.bed?.bed_identifier || "101-A"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Floor {room?.floor_number || 1} • {room?.room_type} Sharing (Capacity: {room?.capacity} Beds)
            </p>
          </div>
          <Badge variant="success" className="text-xs">
            Occupied Active
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 text-[10px]">Agreed Monthly Rent</span>
            <p className="text-base font-bold text-slate-900">{formatINR(stay?.monthly_rent_paise || 700000)}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">Security Deposit Held</span>
            <p className="text-base font-bold text-slate-900">{formatINR(stay?.security_deposit_paise || 1400000)}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px]">Move-in Date</span>
            <p className="text-base font-bold text-slate-900">{stay?.check_in_date || "2026-01-20"}</p>
          </div>
        </div>
      </Card>

      {/* Roommates Card */}
      <Card className="p-5 border-slate-200 bg-white">
        <h3 className="text-sm font-bold text-slate-900 flex items-center mb-3">
          <Users className="h-4 w-4 mr-1.5 text-blue-600" /> Roommates in Room {room?.room_number}
        </h3>

        {roommates.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No other residents in this room.</p>
        ) : (
          <div className="space-y-2">
            {roommates.map((mate) => (
              <div
                key={mate.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {mate.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{mate.full_name}</p>
                    <p className="text-[11px] text-slate-500">
                      Bed {mate.current_stay?.bed?.bed_identifier || "101-B"} • {mate.notes || "Resident"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Room Amenities */}
      <Card className="p-5 border-slate-200 bg-white">
        <h3 className="text-sm font-bold text-slate-900 flex items-center mb-3">
          <Sparkles className="h-4 w-4 mr-1.5 text-amber-500" /> Room & Property Amenities
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-700">
          <span className="flex items-center"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-2" /> Attached Washroom</span>
          <span className="flex items-center"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-2" /> Geyser & Hot Water</span>
          <span className="flex items-center"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-2" /> High-Speed Wi-Fi</span>
          <span className="flex items-center"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-2" /> 3 Meals Daily</span>
          <span className="flex items-center"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-2" /> Daily Housekeeping</span>
          <span className="flex items-center"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-2" /> Power Backup</span>
        </div>
      </Card>

      {/* House Rules */}
      <Card className="p-5 border-slate-200 bg-white">
        <h3 className="text-sm font-bold text-slate-900 flex items-center mb-2">
          <Shield className="h-4 w-4 mr-1.5 text-purple-600" /> House Rules & Gate Timings
        </h3>
        <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
          <p>1. Gate closes at 11:30 PM sharp for resident safety.</p>
          <p>2. Non-resident visitors restricted after 9:00 PM.</p>
          <p>3. Smoking and alcohol prohibited inside the building.</p>
          <p>4. 30 days written notice required before vacating to settle security deposit.</p>
        </div>
      </Card>
    </div>
  );
}
