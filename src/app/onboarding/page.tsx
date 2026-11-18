"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { appStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, BedDouble, Receipt, CheckCircle, ArrowRight, ArrowLeft, Plus, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { formatINR } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = React.useState(1);

  // Step 1: Organization Details
  const [orgName, setOrgName] = React.useState("Balaji Coliving Stays");
  const [city, setCity] = React.useState("Bengaluru");
  const [state, setState] = React.useState("Karnataka");
  const [gstNumber, setGstNumber] = React.useState("29AABCS1429B1ZB");

  // Step 2: First Property Details
  const [propertyName, setPropertyName] = React.useState("Balaji Executive PG");
  const [propertyType, setPropertyType] = React.useState<"pg" | "hostel" | "co_living">("pg");
  const [address, setAddress] = React.useState("17, 5th Cross, Tavarekere Main Road, BTM 1st Stage");
  const [pincode, setPincode] = React.useState("560029");
  const [contactPhone, setContactPhone] = React.useState("+91 98450 99881");
  const [floors, setFloors] = React.useState(3);

  // Step 3: Configure Rooms & Beds
  const [roomsConfig, setRoomsConfig] = React.useState([
    { roomNumber: "101", floor: 1, type: "double", capacity: 2, rentRupees: 7500 },
    { roomNumber: "102", floor: 1, type: "triple", capacity: 3, rentRupees: 6000 },
    { roomNumber: "201", floor: 2, type: "single", capacity: 1, rentRupees: 13000 },
    { roomNumber: "202", floor: 2, type: "double", capacity: 2, rentRupees: 8000 },
  ]);

  // Step 4: Rent Settings & Due Policy
  const [rentDueDay, setRentDueDay] = React.useState("5");
  const [lateFeeRupees, setLateFeeRupees] = React.useState("200");
  const [depositRuleMonths, setDepositRuleMonths] = React.useState("2");

  const addRoomRow = () => {
    const nextNum = 300 + roomsConfig.length;
    setRoomsConfig([
      ...roomsConfig,
      { roomNumber: `${nextNum}`, floor: 3, type: "double", capacity: 2, rentRupees: 7500 },
    ]);
  };

  const removeRoomRow = (index: number) => {
    if (roomsConfig.length <= 1) return;
    setRoomsConfig(roomsConfig.filter((_, i) => i !== index));
  };

  const updateRoomRow = (index: number, key: string, value: any) => {
    const updated = [...roomsConfig];
    updated[index] = { ...updated[index], [key]: value };
    if (key === "type") {
      if (value === "single") updated[index].capacity = 1;
      else if (value === "double") updated[index].capacity = 2;
      else if (value === "triple") updated[index].capacity = 3;
      else if (value === "four_plus") updated[index].capacity = 4;
    }
    setRoomsConfig(updated);
  };

  const totalBedsConfigured = roomsConfig.reduce((acc, r) => acc + Number(r.capacity), 0);

  const handleCompleteSetup = () => {
    // 1. Create property in store
    const createdProp = appStore.createProperty({
      name: propertyName,
      property_type: propertyType,
      address,
      city,
      state,
      pincode,
      contact_phone: contactPhone,
      total_floors: Number(floors),
      amenities: ["Wi-Fi", "Daily Cleaning", "3 Meals Included", "Power Backup"],
      is_active: true,
      rules_and_policies: "Rent due on 5th. 30 days notice required.",
    });

    // 2. Create rooms and beds in store
    for (const r of roomsConfig) {
      appStore.createRoom({
        property_id: createdProp.id,
        room_number: r.roomNumber,
        floor_number: Number(r.floor),
        room_type: r.type as any,
        capacity: Number(r.capacity),
        base_rent_paise: Number(r.rentRupees) * 100,
        amenities: ["Attached Washroom", "Cupboards"],
        status: "active",
      });
    }

    toast({
      title: "Setup Completed Successfully!",
      description: `Created "${propertyName}" with ${roomsConfig.length} rooms and ${totalBedsConfigured} beds.`,
      type: "success",
    });

    router.push("/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-40px)] py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header & Steps tracker */}
        <div className="text-center space-y-2">
          <Badge variant="default" className="text-blue-700 bg-blue-50 border-blue-200">
            Owner Onboarding Wizard
          </Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configure Your PG & Rooms</h1>
          <p className="text-sm text-slate-500">Complete these quick steps to access your management dashboard</p>

          <div className="flex items-center justify-center space-x-2 pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    step === s
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : step > s
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 w-10 sm:w-16 mx-1 rounded ${
                      step > s ? "bg-emerald-600" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-sm mx-auto text-[11px] font-medium text-slate-500 pt-1">
            <span className={step >= 1 ? "text-blue-600 font-semibold" : ""}>Organization</span>
            <span className={step >= 2 ? "text-blue-600 font-semibold" : ""}>Property</span>
            <span className={step >= 3 ? "text-blue-600 font-semibold" : ""}>Rooms & Beds</span>
            <span className={step >= 4 ? "text-blue-600 font-semibold" : ""}>Rent Rules</span>
          </div>
        </div>

        <Card className="border-slate-200 shadow-xl shadow-slate-100">
          {/* STEP 1: ORGANIZATION */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Step 1: Organization Details</CardTitle>
                <CardDescription>
                  Your business entity name, city, and tax details for automated invoicing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Organization / Brand Name</label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                    <Input value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">GST Number (Optional)</label>
                  <Input
                    placeholder="e.g. 29AAAAA0000A1Z5"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t border-slate-100 pt-4">
                <Button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-700">
                  Next: Add First Property <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 2: FIRST PROPERTY */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Step 2: Add First Property Building</CardTitle>
                <CardDescription>
                  Enter the primary PG or hostel building name, location, and total floors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Property Name</label>
                    <Input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Property Type</label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value as any)}
                      className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pg">Paying Guest (PG)</option>
                      <option value="hostel">Student Hostel</option>
                      <option value="co_living">Co-Living Space</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">PIN Code</label>
                    <Input value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Manager Phone</label>
                    <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Number of Floors</label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={floors}
                      onChange={(e) => setFloors(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-100 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700">
                  Next: Configure Rooms & Beds <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 3: CONFIGURE ROOMS & BEDS */}
          {step === 3 && (
            <>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Step 3: Configure Rooms & Beds</CardTitle>
                  <CardDescription>
                    Configure initial rooms. Bed codes (e.g. 101-A, 101-B) are auto-generated from capacity.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="success">Total Beds: {totalBedsConfigured}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {roomsConfig.map((room, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                    >
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-500 font-medium">Room No.</label>
                        <Input
                          value={room.roomNumber}
                          onChange={(e) => updateRoomRow(idx, "roomNumber", e.target.value)}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-500 font-medium">Floor</label>
                        <Input
                          type="number"
                          value={room.floor}
                          onChange={(e) => updateRoomRow(idx, "floor", Number(e.target.value))}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-500 font-medium">Sharing Type</label>
                        <select
                          value={room.type}
                          onChange={(e) => updateRoomRow(idx, "type", e.target.value)}
                          className="flex h-8 w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                        >
                          <option value="single">Single (1 Bed)</option>
                          <option value="double">Double (2 Beds)</option>
                          <option value="triple">Triple (3 Beds)</option>
                          <option value="four_plus">Four+ (4 Beds)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-500 font-medium">Monthly Rent (₹)</label>
                        <Input
                          type="number"
                          value={room.rentRupees}
                          onChange={(e) => updateRoomRow(idx, "rentRupees", Number(e.target.value))}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                      <div className="sm:col-span-1 flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => removeRoomRow(idx)}
                          disabled={roomsConfig.length <= 1}
                          className="text-slate-400 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRoomRow}
                  className="w-full border-dashed border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Another Room
                </Button>
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-100 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700">
                  Next: Rent Policies <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </>
          )}

          {/* STEP 4: RENT RULES & SETTINGS */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle className="text-lg">Step 4: Rent Settings & Due Policies</CardTitle>
                <CardDescription>
                  Configure monthly billing cycle, grace periods, and deposit rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Rent Due Day of Month
                    </label>
                    <select
                      value={rentDueDay}
                      onChange={(e) => setRentDueDay(e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm shadow-xs"
                    >
                      <option value="1">1st of Month</option>
                      <option value="5">5th of Month (Recommended)</option>
                      <option value="10">10th of Month</option>
                      <option value="15">15th of Month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Default Late Fee (₹)
                    </label>
                    <Input
                      type="number"
                      value={lateFeeRupees}
                      onChange={(e) => setLateFeeRupees(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Security Deposit Rule
                    </label>
                    <select
                      value={depositRuleMonths}
                      onChange={(e) => setDepositRuleMonths(e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-slate-300 bg-white px-3 py-1 text-sm shadow-xs"
                    >
                      <option value="1">1 Month Rent</option>
                      <option value="2">2 Months Rent (Standard)</option>
                      <option value="3">3 Months Rent</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 space-y-1">
                  <div className="flex items-center font-semibold text-blue-950">
                    <Sparkles className="h-4 w-4 mr-1.5 text-blue-600" />
                    Review Summary Before Finalizing
                  </div>
                  <p>• Organization: <span className="font-semibold">{orgName} ({city}, {state})</span></p>
                  <p>• Property: <span className="font-semibold">{propertyName}</span> with {roomsConfig.length} rooms ({totalBedsConfigured} total beds)</p>
                  <p>• Due Date: <span className="font-semibold">{rentDueDay}th of each month</span> with ₹{lateFeeRupees} default late fee</p>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-100 pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleCompleteSetup} className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20">
                  <CheckCircle className="mr-2 h-4 w-4" /> Finish & Open Dashboard
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
