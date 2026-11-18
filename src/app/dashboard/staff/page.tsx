"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { Profile, Property } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCog, ShieldCheck, Building2, CheckCircle2 } from "lucide-react";

export default function StaffPage() {
  const [properties, setProperties] = React.useState<Property[]>([]);

  React.useEffect(() => {
    setProperties(appStore.getProperties());
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff & Manager Scoping</h1>
        <p className="text-xs text-slate-500 mt-1">
          Role-Based Access Control (RBAC): Assign property managers to specific buildings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Card */}
        <Card className="p-5 border-slate-200 bg-white space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              RM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm">Rajesh Menon</h3>
                <Badge variant="default" className="text-[10px]">Owner / Admin</Badge>
              </div>
              <p className="text-xs text-slate-500">owner@staymanage.demo • +91 98765 43210</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
            <p className="font-semibold text-slate-800 flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1 text-blue-600" /> Full Organization Access
            </p>
            <p className="text-slate-600">
              Can manage all properties, delete rooms, generate monthly billing, manage staff permissions, and view complete organization financials.
            </p>
          </div>
        </Card>

        {/* Manager Card */}
        <Card className="p-5 border-slate-200 bg-white space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
              SK
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm">Suresh Kumar</h3>
                <Badge variant="secondary" className="text-[10px]">Property Manager</Badge>
              </div>
              <p className="text-xs text-slate-500">manager@staymanage.demo • +91 98765 43211</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs space-y-2">
            <p className="font-semibold text-blue-950 flex items-center">
              <Building2 className="h-4 w-4 mr-1 text-blue-600" /> Assigned Property Scope:
            </p>
            <div className="flex items-center space-x-1.5 text-blue-900 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Green Nest PG (Koramangala, Bengaluru)</span>
            </div>
            <p className="text-[11px] text-slate-600 pt-1">
              Restricted from accessing Urban Stay Hostel or organization billing settings.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
