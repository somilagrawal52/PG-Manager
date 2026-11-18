"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Settings, ShieldCheck, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const org = appStore.getState().organization;

  const [orgName, setOrgName] = React.useState(org.name);
  const [email, setEmail] = React.useState(org.contact_email);
  const [phone, setPhone] = React.useState(org.contact_phone);
  const [gst, setGst] = React.useState(org.gst_number || "");
  const [rentDueDay, setRentDueDay] = React.useState("5");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    appStore.getState().organization = {
      ...org,
      name: orgName,
      contact_email: email,
      contact_phone: phone,
      gst_number: gst,
    };
    toast({ title: "Settings Saved", description: "Organization profile updated.", type: "success" });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Organization Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure business details, GSTIN, default billing policies, and application localization
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Business Profile */}
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Business Profile & Tax Details</CardTitle>
            <CardDescription>Appears on all printed payment receipts and tenant agreements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Organization / Brand Name</label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Support Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">GSTIN Number</label>
                <Input value={gst} onChange={(e) => setGst(e.target.value)} />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Primary Currency & Timezone</label>
                <div className="flex space-x-2">
                  <Input value="INR (₹)" disabled className="bg-slate-50" />
                  <Input value="Asia/Kolkata (IST)" disabled className="bg-slate-50" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rent & Billing Defaults */}
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Default Billing Rules</CardTitle>
            <CardDescription>Standard due dates and grace periods for monthly rent generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Monthly Rent Due Date</label>
                <select
                  value={rentDueDay}
                  onChange={(e) => setRentDueDay(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="1">1st of Month</option>
                  <option value="5">5th of Month</option>
                  <option value="10">10th of Month</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Notice Period Requirement</label>
                <Input value="30 Days Mandatory" disabled className="bg-slate-50" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t border-slate-100 pt-4">
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
              Save Preferences
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
