"use client";

import * as React from "react";
import Link from "next/link";
import { appStore } from "@/lib/store";
import { Property, PropertyType } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Building2, MapPin, Phone, BedDouble, Plus, Users, Shield, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function PropertiesPage() {
  const { toast } = useToast();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [propertyType, setPropertyType] = React.useState<PropertyType>("pg");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("Bengaluru");
  const [state, setState] = React.useState("Karnataka");
  const [pincode, setPincode] = React.useState("560001");
  const [phone, setPhone] = React.useState("+91 98765 00000");
  const [floors, setFloors] = React.useState(2);
  const [description, setDescription] = React.useState("");

  const loadProperties = React.useCallback(() => {
    setProperties(appStore.getProperties());
  }, []);

  React.useEffect(() => {
    loadProperties();
    const unsubscribe = appStore.subscribe(loadProperties);
    return unsubscribe;
  }, [loadProperties]);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prop = appStore.createProperty({
        name,
        property_type: propertyType,
        address,
        city,
        state,
        pincode,
        contact_phone: phone,
        total_floors: Number(floors),
        description,
        amenities: ["Wi-Fi", "Daily Cleaning", "Security Guard", "RO Water"],
        is_active: true,
      });

      toast({
        title: "Property Created",
        description: `"${prop.name}" successfully added to your organization.`,
        type: "success",
      });

      setIsAddOpen(false);
      setName("");
      setAddress("");
      setDescription("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create property",
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Properties & Buildings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your PG buildings, hostels, managers, and floor plans
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-xs h-8">
          <Plus className="h-3.5 w-3.5 mr-1" /> Add New Property
        </Button>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((property) => {
          const rooms = appStore.getRooms(property.id);
          const beds = appStore.getBeds().filter((b) => b.property_id === property.id);
          const occupiedCount = beds.filter((b) => b.status === "occupied").length;
          const occupancyPct = beds.length > 0 ? Math.round((occupiedCount / beds.length) * 100) : 0;

          return (
            <Card key={property.id} className="overflow-hidden border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                {/* Optional Property Image banner */}
                <div className="h-44 bg-slate-800 relative overflow-hidden">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.name}
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-800 to-slate-900 text-slate-500">
                      <Building2 className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex space-x-1.5">
                    <Badge variant="default" className="bg-white/95 text-slate-900 uppercase font-semibold text-[10px] shadow-sm">
                      {property.property_type.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h2 className="text-xl font-bold drop-shadow-md">{property.name}</h2>
                    <p className="text-xs text-slate-200 flex items-center drop-shadow-sm mt-0.5">
                      <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                      {property.city}, {property.state}
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {property.description || "Well-maintained accommodation with modern amenities."}
                  </p>

                  {/* Property Quick Metrics */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                    <div>
                      <p className="text-slate-500 text-[10px]">Total Floors</p>
                      <p className="text-base font-bold text-slate-900">{property.total_floors}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px]">Rooms</p>
                      <p className="text-base font-bold text-slate-900">{rooms.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px]">Occupancy</p>
                      <p className="text-base font-bold text-emerald-600">{occupancyPct}%</p>
                    </div>
                  </div>

                  {/* Bed Breakdown */}
                  <div className="flex justify-between items-center text-xs text-slate-600 pt-1">
                    <span>
                      Occupied: <strong className="text-slate-900">{occupiedCount}</strong> / {beds.length} Beds
                    </span>
                    <span className="text-emerald-600 font-semibold">
                      {beds.length - occupiedCount} Available
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${occupancyPct}%` }} />
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1" /> {property.contact_phone}
                </span>
                <Link href={`/dashboard/properties/${property.id}`}>
                  <Button size="sm" variant="ghost" className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2">
                    Manage Building <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Property Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Register a new PG building, hostel, or co-living property under your organization
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProperty} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Property Name</label>
                <Input
                  placeholder="e.g. Skyline PG for Gents"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="pg">Paying Guest (PG)</option>
                  <option value="hostel">Student Hostel</option>
                  <option value="co_living">Co-Living Space</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Address</label>
              <Input
                placeholder="Street address, landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">City</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">State</label>
                <Input value={state} onChange={(e) => setState(e.target.value)} required />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">PIN Code</label>
                <Input value={pincode} onChange={(e) => setPincode(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Total Floors</label>
                <Input
                  type="number"
                  min={1}
                  max={25}
                  value={floors}
                  onChange={(e) => setFloors(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Description & Highlights</label>
              <Input
                placeholder="Near metro station, food included, daily housekeeping..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
                Save Property
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
