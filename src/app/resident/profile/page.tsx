"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { Resident } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, ShieldCheck, HeartHandshake } from "lucide-react";

export default function ResidentProfilePage() {
  const residentId = "res-001";
  const [resident, setResident] = React.useState<Resident | undefined>(() => appStore.getResident(residentId));

  React.useEffect(() => {
    setResident(appStore.getResident(residentId));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Resident Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Personal details, emergency contacts, and ID verification</p>
      </div>

      <Card className="p-5 border-slate-200 bg-white space-y-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xl shadow-md shadow-blue-500/20">
            {resident?.full_name.slice(0, 2).toUpperCase() || "RS"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">{resident?.full_name}</h2>
              <Badge variant="success" className="text-[10px]">Verified Tenant</Badge>
            </div>
            <p className="text-xs text-slate-500">Resident ID: {resident?.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Contact Number</span>
            <p className="font-semibold text-slate-800">{resident?.phone}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Email Address</span>
            <p className="font-semibold text-slate-800">{resident?.email || "—"}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Emergency Contact Person</span>
            <p className="font-semibold text-slate-800">{resident?.emergency_contact_name || "—"}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Emergency Phone</span>
            <p className="font-semibold text-slate-800">{resident?.emergency_contact_phone || "—"}</p>
          </div>
        </div>

        {resident?.permanent_address && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Permanent Home Address</span>
            <p className="font-medium text-slate-800">{resident.permanent_address}</p>
          </div>
        )}

        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-950 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="font-semibold">KYC Verification Completed</p>
              <p className="text-[11px] text-emerald-800">
                Document on file: {resident?.id_proof_type || "Govt. Photo ID"}
              </p>
            </div>
          </div>
          <Badge variant="success" className="text-[10px]">Verified</Badge>
        </div>
      </Card>
    </div>
  );
}
