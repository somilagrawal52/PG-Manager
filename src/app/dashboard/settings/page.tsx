"use client";

import * as React from "react";
import { appStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Settings, ShieldCheck, IndianRupee, Clock, CheckCircle2, Database, RefreshCw, HardDrive } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const org = appStore.getState().organization;

  const [orgName, setOrgName] = React.useState(org.name);
  const [email, setEmail] = React.useState(org.contact_email);
  const [phone, setPhone] = React.useState(org.contact_phone);
  const [gst, setGst] = React.useState(org.gst_number || "");
  const [rentDueDay, setRentDueDay] = React.useState("5");
  const [mongoStatus, setMongoStatus] = React.useState<any>(null);
  const [loadingMongo, setLoadingMongo] = React.useState(false);
  const [seeding, setSeeding] = React.useState(false);

  const fetchMongoStatus = async () => {
    try {
      setLoadingMongo(true);
      const res = await fetch("/api/mongodb/status");
      const data = await res.json();
      setMongoStatus(data);
    } catch (e: any) {
      setMongoStatus({ connected: false, error: e.message });
    } finally {
      setLoadingMongo(false);
    }
  };

  React.useEffect(() => {
    fetchMongoStatus();
  }, []);

  const handleReSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/mongodb/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "MongoDB Seeded",
          description: `Seeded ${data.seeded.properties} properties, ${data.seeded.rooms} rooms, ${data.seeded.beds} beds, ${data.seeded.residents} residents.`,
          type: "success",
        });
        await fetchMongoStatus();
      } else {
        toast({ title: "Seed Failed", description: data.error, type: "error" });
      }
    } catch (e: any) {
      toast({ title: "Seed Error", description: e.message, type: "error" });
    } finally {
      setSeeding(false);
    }
  };

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

        {/* Database & MongoDB Status */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-sm font-semibold">Local Database Connection (MongoDB)</CardTitle>
                <Badge className={mongoStatus?.connected ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                  {mongoStatus?.connected ? "Connected" : "Checking..."}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Connected to local MongoDB instance: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">mongodb://localhost:27017/staymanage</code>
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchMongoStatus}
                disabled={loadingMongo}
                className="text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loadingMongo ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReSeed}
                disabled={seeding}
                className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                {seeding ? "Seeding..." : "Re-seed Mock Data"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mongoStatus?.connected && mongoStatus.counts ? (
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{mongoStatus.counts.properties}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Properties</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{mongoStatus.counts.rooms}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Rooms</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{mongoStatus.counts.beds}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Beds</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{mongoStatus.counts.residents}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Residents</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{mongoStatus.counts.rent_charges}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Rent Invoices</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{mongoStatus.counts.payments}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Payments</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{mongoStatus.counts.deposits}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Deposit Txns</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-900">{mongoStatus.counts.maintenance_tickets}</div>
                  <div className="text-[10px] text-slate-500 font-medium">Complaints</div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-xs italic">Checking MongoDB database health on localhost:27017...</p>
            )}
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
